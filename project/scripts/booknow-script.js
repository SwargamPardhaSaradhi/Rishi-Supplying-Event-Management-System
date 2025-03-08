  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
  import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const database = getDatabase(app);

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.submit-button').addEventListener('click', openPopup);
    document.querySelector('.confirm-popup').addEventListener('click', confirmSelection);
    document.querySelector('.close-popup').addEventListener('click', closePopup);
  });

  let selectedItems = [];

  function openPopup() {
    selectedItems = [];
    const items = document.querySelectorAll('.item-checkbox');
    items.forEach(item => {
      if (item.checked) {
        const itemLabel = item.closest('.item').querySelector('.item-name').textContent;
        selectedItems.push(itemLabel);
      }
    });


    
    const itemsList = document.getElementById('selected-items-list');
    itemsList.innerHTML = '';
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        itemsList.appendChild(listItem);
      });
    } else {
      const noItems = document.createElement('li');
      noItems.textContent = 'No items selected';
      itemsList.appendChild(noItems);
    }
    document.getElementById('popup').style.display = 'flex';
  }

  function closePopup() {
    document.getElementById('popup').style.display = 'none';
  }

  function confirmSelection() {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to continue booking!');
      return;
    }
    document.getElementById('selected-items-list').style.display = 'none';
    document.getElementById('popbet').style.display = 'none';
    document.getElementById('somef').style.display='none';  
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const customerRef = ref(database, `customers/${user.email.replace(/\./g, ',')}`);

        get(customerRef).then((snapshot) => {
          if (snapshot.exists()) {
            const loadingSpinner = document.getElementById('loading-spinner');
            loadingSpinner.style.display = 'none';
            document.getElementById('selected-items-list').innerHTML = '';
            document.getElementById('popbet').innerHTML = '';
            document.getElementById('somef').innerHTML = '';
            document.getElementById('rem').style.display = 'none';
            document.getElementById('email-exists-popup').style.display = 'block';
          } else {
            const loadingSpinner = document.getElementById('loading-spinner');
            loadingSpinner.style.display = 'none';
            document.getElementById('selected-items-list').innerHTML = '';
            document.getElementById('popbet').innerHTML = '';
            document.getElementById('somef').innerHTML = '';
            document.getElementById('profile-info').style.display = 'block';
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('selected-items-list').style.display = 'none';
            document.getElementById('profile-pic').src = user.photoURL || 'default-profile-pic.jpg';
            document.getElementById('profile-name').textContent = user.displayName;

            document.querySelector('.submit-info').addEventListener('click', function() {
              const userName = document.getElementById('user-name').value;
              const userMobile = document.getElementById('user-mobile').value;
              const userAddress = document.getElementById('user-address').value;
              const userEventDate = document.getElementById('user-event-date').value;
              const userTime = document.getElementById('user-time').value;
              const userDescription = document.getElementById('user-description').value;

              const phoneRegex = /^[0-9]{10}$/;
              if (!userName || !userMobile || !userAddress || !userEventDate) {
                alert('Please fill in all the fields!');
                return;
              }
              if (!phoneRegex.test(userMobile)) {
                alert('Please enter a valid 10-digit phone number!');
                return;
              }
              const eventDropdown = document.getElementById('event-type');
              let selectedEvent = eventDropdown.value;
              if (selectedEvent === 'others') {
                const otherEventInput = document.getElementById('other-event');
                selectedEvent = `${otherEventInput.value.trim()}`;
              }
              const loadingSpinner = document.getElementById('loading-spinner');
              document.getElementById('profile-info').style.display = 'none';
              loadingSpinner.style.display = 'block';

              const currentDate = new Date().toISOString().split('T')[0]; 
              const currentTime = new Date().toISOString().split('T')[1].split('.')[0];
              set(customerRef, {
                name: userName,
                phoneNumber: userMobile,
                address: userAddress,
                event: selectedEvent,
                eventDate: userEventDate,
                eventTime: userTime,
                eventDescription: userDescription,
                selectedItems: selectedItems,
                status: 0,
                createdDate: currentDate, 
                createdTime: currentTime 
              }
            
            ).then(() => {
                const loadingSpinner = document.getElementById('loading-spinner');
                loadingSpinner.style.display = 'none';
                document.getElementById('profile-info').style.display = 'none';
                document.getElementById('rem').style.display = 'none';
                document.getElementById('thank-you-container').style.display = 'block';
              }).catch((error) => {
                alert('Error saving data: ' + error.message);
              });
            });
          }
        }).catch((error) => {
          const loadingSpinner = document.getElementById('loading-spinner');
            loadingSpinner.style.display = 'none';
          console.error('Error checking email existence:', error);
          alert('Error checking email existence. Please try again.');
        });
      })
      .catch((error) => {
        document.getElementById('selected-items-list').style.display = 'flex';
        document.getElementById('popbet').style.display = 'flex';
        document.getElementById('somef').style.display='block';
        document.getElementById('rem').style.display = 'block';
        const loadingSpinner = document.getElementById('loading-spinner');
            loadingSpinner.style.display = 'none';
        alert('There was an issue with authentication. Please try again.');
      });
  }
  document.querySelectorAll('.package-button').forEach((button, index) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => checkbox.checked = false);
        const packageName = button.parentElement.querySelector('h3').innerText;
        const packageMessage = document.getElementById('selected-package-message');
        document.getElementById('package-name').textContent = packageName;
        packageMessage.style.display = 'block';
        const availableItemsSection = document.querySelector('.item-list');
        availableItemsSection.scrollIntoView({ behavior: 'smooth' });
        
    });
});
