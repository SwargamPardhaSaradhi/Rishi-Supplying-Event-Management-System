import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKfyrQ9Gg2yoKW8u4DE8njwgIT5avWm9s",
  authDomain: "rishi-supplying.firebaseapp.com",
  projectId: "rishi-supplying",
  storageBucket: "rishi-supplying.firebasestorage.app",
  messagingSenderId: "411423125014",
  appId: "1:411423125014:web:e56cbe4c6749dc804c0f37",
  measurementId: "G-KJK439N1ZS"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const tableBody = document.querySelector('#data-table tbody');
const totalCount = document.getElementById('total-count');
const acceptedCount = document.getElementById('accepted-count');
const rejectedCount = document.getElementById('rejected-count');
const searchBar = document.getElementById('search-bar');
let currentFilter = 'all';
const navAll = document.getElementById('nav-all');
const navPending = document.getElementById('nav-pending');
const navAccepted = document.getElementById('nav-accepted');
const navRejected = document.getElementById('nav-rejected');
const navHome = document.getElementById('nav-home');
const loadingSpinner = document.getElementById('loading-spinner');

loadingSpinner.style.display = 'flex';
document.getElementById('unload').style.display = 'none';
let bookings = [];

function fetchData() {
  const customersRef = ref(database, 'customers');
  onValue(customersRef, (snapshot) => {
    tableBody.innerHTML = '';
    bookings = [];

    let total = 0;
    let accepted = 0;
    let rejected = 0;
    let pending = 0;

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const customer = data[key];
        bookings.push({ ...customer, email: key.replace(/,/g, '.') });

        total++;
        if (customer.status === 1) accepted++;
        if (customer.status === 2) rejected++;
        if (customer.status === 0) pending++;
      });

      totalCount.textContent = total;
      acceptedCount.textContent = accepted;
      rejectedCount.textContent = rejected;
      document.getElementById('pending-count').textContent=pending;

      displayBookings(bookings);
    } else {
      totalCount.textContent = 0;
      acceptedCount.textContent = 0;
      document.getElementById('pending-count').textContent=0;
      rejectedCount.textContent = 0;
      displayBookings([]);
    }
    loadingSpinner.style.display = 'none';
      document.getElementById('unload').style.display = 'block';
  }, (error) => {
    loadingSpinner.style.display = 'none';
      document.getElementById('unload').style.display = 'block';
    console.error('Error fetching data:', error);
  });
}

function displayBookings(filteredBookings) {
  tableBody.innerHTML = '';
  if (filteredBookings.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="12">No data found</td>`;
    tableBody.appendChild(row);
    return;
  }

  filteredBookings.forEach((customer) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phoneNumber}</td>
      <td>${customer.address}</td>
      <td>${customer.event}</td>
      <td>${customer.eventDate}</td>
      <td>${customer.eventTime}</td>
      <td>${(customer.selectedItems || []).join(', ')}</td>
      <td>${customer.eventDescription || 'N/A'}</td>
      <td>${customer.createdDate || 'N/A'}</td>
      <td>${customer.createdTime || 'N/A'}</td>
       <td>${customer.status === 1 ? 'Accepted' : customer.status === 2 ? 'Rejected' : 'Pending'}</td>
      <td><button class="edit-button" data-key="${customer.email}">Edit</button>
      <button class="delete-button" data-key="${customer.email}">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll('.edit-button').forEach((button) => {
    button.addEventListener('click', openEditModal);
  });
  document.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', deleteBooking);
  });
}


navAll.addEventListener('click', () =>{ 
  document.getElementById('search-bar').style.display='block';
  document.getElementById('add-new-booking').style.display='block';
    displayBookings(bookings)
    document.getElementById('summary').style.display='none';
    document.getElementById('data-table').style.display='table';
    document.getElementById('ben').style.display='none';
    document.getElementById('events-summary').style.display='none';
});
navPending.addEventListener('click', () => {
  document.getElementById('add-new-booking').style.display='block';
  document.getElementById('search-bar').style.display='block';
  document.getElementById('ben').style.display='none';
  document.getElementById('events-summary').style.display='none';
  document.getElementById('summary').style.display='none';
  currentFilter = 'pending';
  applyFilterAndSearch();
    document.getElementById('data-table').style.display='table';
    displayBookings(bookings.filter((b) => b.status === 0))});
navAccepted.addEventListener('click', () =>{
  document.getElementById('add-new-booking').style.display='block';
  document.getElementById('search-bar').style.display='flex';
  document.getElementById('ben').style.display='none';
  document.getElementById('events-summary').style.display='none';
  currentFilter = 'accepted';
  applyFilterAndSearch()
    document.getElementById('summary').style.display='none';
    document.getElementById('data-table').style.display='table';
 displayBookings(bookings.filter((b) => b.status === 1))});
navRejected.addEventListener('click', () => {
  document.getElementById('add-new-booking').style.display='block';
  document.getElementById('search-bar').style.display='block';
  document.getElementById('ben').style.display='none';
  document.getElementById('events-summary').style.display='none';
    document.getElementById('summary').style.display='none';
    document.getElementById('data-table').style.display='table';
    displayBookings(bookings.filter((b) => b.status === 2))});
    currentFilter = 'rejected';
    applyFilterAndSearch();
navHome.addEventListener('click', () => {
  document.getElementById('add-new-booking').style.display='none';
  document.getElementById('search-bar').style.display='none';
  document.getElementById('ben').style.display='block';
  document.getElementById('events-summary').style.display='flex';
    document.getElementById('summary').style.display='flex';
    document.getElementById('data-table').style.display='none';
});

fetchData();

let editingKey = null;
const availableItems = [
    "German Tent", "Super Structure", "Platform", "Green mats and Red mat", "Pendals", "Chairs", "Cooking Items", "Sofa", "Coolers", "Dj", "Led Lights", "Truss","Table","Barkadings","Frames","Side Walls"
  ];
  
  function openEditModal(event) {
    editingKey = event.target.dataset.key.replace(/\./g, ',');
    const customer = bookings.find((b) => b.email.replace(/\./g, ',') === editingKey);
  
    if (!customer) {
      console.error('Customer not found');
      return;
    }
  
    // Populate form fields
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-phone').value = customer.phoneNumber || '';
    document.getElementById('edit-address').value = customer.address || '';
    document.getElementById('edit-event').value = customer.event || '';
    document.getElementById('edit-date').value = customer.eventDate || '';
    document.getElementById('edit-time').value = customer.eventTime || '';
    document.getElementById('edit-description').value = customer.eventDescription || '';

    
    const statusSelect = document.getElementById('edit-status');
    statusSelect.value = customer.status !== undefined ? customer.status : '0';
  
    // Populate the checkboxes for selected items
    const editItemsDiv = document.getElementById('edit-items');
    editItemsDiv.innerHTML = ''; // Clear existing checkboxes
  
    availableItems.forEach((item) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = item;
      checkbox.value = item;
      checkbox.name = 'selectedItems';
      
      // If the item is selected for the customer, check the box
      if (customer.selectedItems && customer.selectedItems.includes(item)) {
        checkbox.checked = true;
      }
  
      const label = document.createElement('label');
      label.setAttribute('for', item);
      label.innerText = item;
  
      editItemsDiv.appendChild(checkbox);
      editItemsDiv.appendChild(label);
      editItemsDiv.appendChild(document.createElement('br'));
    });
  
    document.getElementById('edit-modal').style.display = 'flex';
  }
  
  document.getElementById('save-changes').addEventListener('click', () => {
    const updatedData = {
      name: document.getElementById('edit-name').value,
      phoneNumber: document.getElementById('edit-phone').value,
      address: document.getElementById('edit-address').value,
      event: document.getElementById('edit-event').value,
      eventDate: document.getElementById('edit-date').value,
      eventTime: document.getElementById('edit-time').value,
      status: parseInt(document.getElementById('edit-status').value),
      eventDescription: document.getElementById('edit-description').value,
      selectedItems: []
    };
  
    // Get selected items from the checkboxes
    const selectedItemsCheckboxes = document.querySelectorAll('input[name="selectedItems"]:checked');
    selectedItemsCheckboxes.forEach((checkbox) => {
      updatedData.selectedItems.push(checkbox.value);
    });
  
    if (!updatedData.name || !updatedData.phoneNumber || !updatedData.address || !updatedData.eventDate) {
      alert('Please fill out all fields.');
      return;
    }
   
    const originalData = bookings.find((b) => b.email.replace(/\./g, ',') === editingKey);
    updatedData.createdDate = originalData.createdDate;
   
    updatedData.createdTime = originalData.createdTime;
  
    const customerRef = ref(database, `customers/${editingKey}`);
    set(customerRef, updatedData)
      .then(() => {
        alert('Booking updated successfully!');
        document.getElementById('edit-modal').style.display = 'none';
        fetchData(); // Re-fetch data to reflect changes
      })
      .catch((error) => {
        alert('Error updating data: ' + error.message);
      });
  });
  
  document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
  });
  
  function applyFilterAndSearch() {
    const query = searchBar.value.toLowerCase();
    let filteredBookings;
  
    switch (currentFilter) {
      case 'pending':
        filteredBookings = bookings.filter(
          (b) =>
            b.status === 0 &&
            (b.name.toLowerCase().includes(query) ||
              b.email.toLowerCase().includes(query) ||
              b.phoneNumber.toLowerCase().includes(query))
        );
        break;
      case 'accepted':
        filteredBookings = bookings.filter(
          (b) =>
            b.status === 1 &&
            (b.name.toLowerCase().includes(query) ||
              b.email.toLowerCase().includes(query) ||
              b.phoneNumber.toLowerCase().includes(query))
        );
        break;
      case 'rejected':
        filteredBookings = bookings.filter(
          (b) =>
            b.status === 2 &&
            (b.name.toLowerCase().includes(query) ||
              b.email.toLowerCase().includes(query) ||
              b.phoneNumber.toLowerCase().includes(query))
        );
        break;
      default:
        filteredBookings = bookings.filter(
          (b) =>
            b.name.toLowerCase().includes(query) ||
            b.email.toLowerCase().includes(query) ||
            b.phoneNumber.toLowerCase().includes(query)
        );
    }
  
    displayBookings(filteredBookings);
  }
  
  searchBar.addEventListener('input', applyFilterAndSearch);
  
  navAll.addEventListener('click', () => {
    currentFilter = 'all';
    applyFilterAndSearch();
  });
  
  navPending.addEventListener('click', () => {
    currentFilter = 'pending';
    applyFilterAndSearch();
  });
  
  navAccepted.addEventListener('click', () => {
    currentFilter = 'accepted';
    applyFilterAndSearch();
  });
  
  navRejected.addEventListener('click', () => {
    currentFilter = 'rejected';
    applyFilterAndSearch();
  });
  
// Containers for today's and upcoming events
const todaysEventsContainer = document.getElementById('todays-events');
const upcomingEventsContainer = document.getElementById('upcoming-events');

// Helper function to format dates as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to populate today's and upcoming events
function populateEvents() {
  const today = new Date();
  const todayFormatted = formatDate(today);

  const upcomingDateLimit = new Date();
  upcomingDateLimit.setDate(today.getDate() + 3);
  const upcomingFormatted = formatDate(upcomingDateLimit);

  const todaysEvents = bookings.filter((event) => event.eventDate === todayFormatted);
  const upcomingEvents = bookings.filter(
    (event) => event.eventDate > todayFormatted && event.eventDate <= upcomingFormatted
  );

  // Populate today's events
  todaysEventsContainer.innerHTML = `<h3>Today's Events</h3>`;
  if (todaysEvents.length === 0) {
    todaysEventsContainer.innerHTML += `<p>No events scheduled for today.</p>`;
  } else {
    todaysEvents.forEach((event) => {
      todaysEventsContainer.innerHTML += `
        <div class="event-item">
          <p><strong>${event.event}</strong> - ${event.name}</p>
          <p>${event.eventDate}, ${event.eventTime}</p>
        </div>`;
    });
  }

  // Populate upcoming events
  upcomingEventsContainer.innerHTML = `<h3>Upcoming Events</h3>`;
  if (upcomingEvents.length === 0) {
    upcomingEventsContainer.innerHTML += `<p>No upcoming events in the next 3 days.</p>`;
  } else {
    upcomingEvents.forEach((event) => {
      upcomingEventsContainer.innerHTML += `
        <div class="event-item">
          <p><strong>${event.event}</strong> - ${event.name}</p>
          <p>${event.eventDate}, ${event.eventTime}</p>
        </div>`;
    });
  }
}

// Call populateEvents whenever data is fetched
onValue(ref(database, 'customers'), (snapshot) => {
  bookings = [];
  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.keys(data).forEach((key) => {
      bookings.push({ ...data[key], email: key.replace(/,/g, '.') });
    });
  }
  populateEvents();
});

function populateNewItems() {
  const itemsContainer = document.getElementById('new-items');
  itemsContainer.innerHTML = ''; // Clear previous items

  availableItems.forEach((item) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `new-item-${item}`;
    checkbox.value = item;

    const label = document.createElement('label');
    label.setAttribute('for', `new-item-${item}`);
    label.innerText = item;

    itemsContainer.appendChild(checkbox);
    itemsContainer.appendChild(label);
    itemsContainer.appendChild(document.createElement('br'));
  });
}

// Call this function when the "Add New" modal is opened
document.getElementById('add-new-booking').addEventListener('click', () => {
  populateNewItems();
  document.getElementById('add-new-modal').style.display = 'flex';
});

document.getElementById('add-new-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const selectedItems = [];
  const selectedCheckboxes = document.querySelectorAll('#new-items input[type="checkbox"]:checked');
  selectedCheckboxes.forEach((checkbox) => {
    selectedItems.push(checkbox.value);
  });

  const newBooking = {
    name: document.getElementById('new-name').value,
    email: document.getElementById('new-email').value.replace(/\./g, ','),
    phoneNumber: document.getElementById('new-phone').value,
    address: document.getElementById('new-address').value,
    event: document.getElementById('new-event').value,
    eventDate: document.getElementById('new-date').value,
    eventTime: document.getElementById('new-time').value,
    eventDescription: document.getElementById('new-description').value,
    selectedItems: selectedItems,
    status: 1, // Default to pending
    createdDate: new Date().toLocaleDateString(),
    createdTime: new Date().toLocaleTimeString(),
  };

  const customerRef = ref(database, `customers/${newBooking.email}`);
  set(customerRef, newBooking)
    .then(() => {
      alert('New booking added successfully!');
      document.getElementById('add-new-modal').style.display = 'none';
      fetchData(); // Re-fetch data to reflect changes
    })
    .catch((error) => {
      alert('Error adding booking: ' + error.message);
    });
});
const addNewModal = document.getElementById('add-new-modal');
const cancelAddNewButton = document.getElementById('cancel-add-new');

cancelAddNewButton.addEventListener('click', () => {
  addNewModal.style.display = 'none';
});

addNewModal.addEventListener('click', (e) => {
  if (e.target === addNewModal) {
    addNewModal.style.display = 'none';
  }
});

function deleteBooking(event) {
  const emailKey = event.target.dataset.key.replace(/\./g, ','); // Convert email to database-friendly format
  const customerRef = ref(database, `customers/${emailKey}`);

  // Confirm deletion
  if (confirm('Are you sure you want to delete this booking?')) {
    set(customerRef, null) // Set the reference to null to delete the data
      .then(() => {
        alert('Booking deleted successfully!');
        fetchData(); // Re-fetch data to reflect the changes
      })
      .catch((error) => {
        alert('Error deleting booking: ' + error.message);
      });
  }
}


