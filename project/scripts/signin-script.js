import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration (same as the one used in your first website)
const firebaseConfig = {
  apiKey: "AIzaSyBKfyrQ9Gg2yoKW8u4DE8njwgIT5avWm9s",
  authDomain: "rishi-supplying.firebaseapp.com",
  projectId: "rishi-supplying",
  storageBucket: "rishi-supplying.firebasestorage.app",
  messagingSenderId: "411423125014",
  appId: "1:411423125014:web:e56cbe4c6749dc804c0f37",
  measurementId: "G-KJK439N1ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const signInButton = document.getElementById('sign-in-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const customerInfoContainer = document.getElementById('customer-card');
const notRegisteredMessage = document.getElementById('not-registered-message');
const bookNowButton = document.getElementById('book-now-btn');
const signOutButton = document.getElementById('sign-out-btn');

// Sign-in with Google
signInButton.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      fetchUserData(user);
    })
    .catch((error) => {
      console.error("Authentication failed:", error.message);
    });
});


document.getElementById('signbtn').addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      signInButton.style.display = 'block';   // Show sign-in button again
      customerInfoContainer.style.display = 'none'; // Hide customer info
      notRegisteredMessage.style.display = 'none'; // Hide the not-registered message
    })
    .catch((error) => {
      console.error("Sign-out failed:", error.message);
    });
});

// Sign out functionality
signOutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      signInButton.style.display = 'block';   // Show sign-in button again
      customerInfoContainer.style.display = 'none'; // Hide customer info
      notRegisteredMessage.style.display = 'none'; // Hide the not-registered message
    })
    .catch((error) => {
      console.error("Sign-out failed:", error.message);
    });
});

// Fetch user-specific data from Firebase
function fetchUserData(user) {
  loadingSpinner.style.display = 'block'; // Show loading spinner
  signInButton.style.display = 'none';    // Hide sign-in button after successful login
  
  const userEmail = user.email.replace(/\./g, ','); // Replace dots in email for Firebase ref
  const userRef = ref(database, `customers/${userEmail}`);
  
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      displayUserData(userData, user.email);
    } else {
      displayNotRegisteredMessage();
    }
  }).catch((error) => {
    console.error("Error fetching user data:", error.message);
    customerInfoContainer.innerHTML = "<p>Error retrieving data. Please try again.</p>";
    loadingSpinner.style.display = 'none';
  });
}

// Display user data in the HTML elements
// Display user data in the HTML elements
function displayUserData(userData, email) {
  document.getElementById('customer-name').querySelector('span').textContent = `Welcome, ${userData.name}` || 'Not Available';
  document.getElementById('customer-email').textContent = email || 'Not Available';
  document.getElementById('customer-phone').textContent = userData.phoneNumber || 'Not Available';
  document.getElementById('customer-address').textContent = userData.address || 'Not Available';
  document.getElementById('customer-event-date').textContent = userData.eventDate || 'Not Available';
  document.getElementById('customer-event-time').textContent = userData.eventTime || 'Not Available';
  document.getElementById('customer-event-description').textContent = userData.eventDescription || 'Not Available';

  const selectedItemsContainer = document.getElementById('customer-items');
  if (userData.selectedItems && userData.selectedItems.length > 0) {
    const itemList = userData.selectedItems.map(item => `<li>${item}</li>`).join('');
    selectedItemsContainer.innerHTML = `<ul class="styled-item-list">${itemList}</ul>`;
  } else {
    selectedItemsContainer.textContent = 'Not Available';
  }

  // Display event, created date, created time
  document.getElementById('customer-event').textContent = userData.event || 'Not Available';

  // Display and highlight the status
  const statusContainer = document.getElementById('customer-status');
  const statusText = userData.status === 0
    ? 'Pending'
    : userData.status === 1
    ? 'Accepted'
    : userData.status === 2
    ? 'Rejected'
    : 'Unknown';
  
  statusContainer.textContent = statusText;
  statusContainer.style.fontWeight = 'bold';
  statusContainer.style.padding = '5px 10px';
  statusContainer.style.borderRadius = '8px';

  // Apply color based on status
  if (userData.status === 0) {
    statusContainer.style.backgroundColor = '#ffeeba'; // Yellow for Pending
    statusContainer.style.color = '#856404';
  } else if (userData.status === 1) {
    statusContainer.style.backgroundColor = '#d4edda'; // Green for Accepted
    statusContainer.style.color = '#155724';
  } else if (userData.status === 2) {
    statusContainer.style.backgroundColor = '#f8d7da'; // Red for Rejected
    statusContainer.style.color = '#721c24';
  } else {
    statusContainer.style.backgroundColor = '#e2e3e5'; // Gray for Unknown
    statusContainer.style.color = '#383d41';
  }

  customerInfoContainer.style.display = 'block'; // Show customer info
  loadingSpinner.style.display = 'none'; // Hide loading spinner
}

// Display a message if the email is not registered
function displayNotRegisteredMessage() {
  notRegisteredMessage.style.display = 'block'; // Show the not-registered message
  loadingSpinner.style.display = 'none'; // Hide loading spinner
}

// Book Now button functionality
bookNowButton.addEventListener('click', () => {
  window.location.href = "../pages/booknow.html"; // Redirect to a booking page (modify URL as needed)
});
