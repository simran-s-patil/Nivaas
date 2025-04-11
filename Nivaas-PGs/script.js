// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Modal Handling
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeButtons = document.querySelectorAll('.close');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === signupModal) {
        signupModal.style.display = 'none';
    }
});

// Global variables
let pgs = [];
let wishlist = [];
const wishlistContainer = document.getElementById('wishlist-container');
const pgsContainer = document.getElementById('pgs-container');
const bookTourBtn = document.getElementById('book-tour-btn');

// Fetch PGs from the server
async function fetchPGs(filters = {}) {
    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.gender) queryParams.append('gender', filters.gender);
        if (filters.facility) queryParams.append('facility', filters.facility);
        if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
        if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
        if (filters.search) queryParams.append('search', filters.search);
        
        const url = `/api/pgs?${queryParams.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        
        pgs = data;
        return pgs;
    } catch (error) {
        console.error('Error fetching PGs:', error);
        showNotification('Failed to load PGs', 'error');
        return [];
    }
}

// Render PGs
function renderPGs() {
    fetchPGs().then(pgs => {
        pgsContainer.innerHTML = '';
        pgs.forEach(pg => {
            const pgCard = document.createElement('div');
            pgCard.className = 'pg-card';
            pgCard.innerHTML = `
                <img src="${pg.image}" alt="${pg.name}">
                <div class="pg-card-content">
                    <h3>${pg.name}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${pg.address}</p>
                    <p><i class="fas fa-rupee-sign"></i> ${pg.rent}/month</p>
                    <p><i class="fas fa-venus-mars"></i> ${pg.gender}</p>
                    <div class="facilities">
                        ${pg.facilities.map(facility => `<span>${facility}</span>`).join(' ')}
                    </div>
                    <div class="pg-action-buttons">
                        <button class="btn primary add-to-wishlist" data-id="${pg.id}">
                            Add to Wishlist
                        </button>
                        <button class="btn secondary book-now" data-id="${pg.id}">
                            Book Now
                        </button>
                    </div>
                </div>
            `;
            pgsContainer.appendChild(pgCard);
        });

        // Add event listeners to wishlist buttons
        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const pgId = parseInt(e.target.dataset.id);
                addToWishlist(pgId);
            });
        });

        // Add event listeners to book now buttons
        document.querySelectorAll('.book-now').forEach(button => {
            button.addEventListener('click', (e) => {
                const pgId = parseInt(e.target.dataset.id);
                bookPg(pgId);
            });
        });
    });
}

// Add filter functionality
const locationFilter = document.getElementById('location');
const genderFilter = document.getElementById('gender');
const facilitiesFilter = document.getElementById('facilities');
const minPriceFilter = document.getElementById('min-price');
const maxPriceFilter = document.getElementById('max-price');

// Add search functionality
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-btn');

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Update filters and fetch filtered PGs
    const filters = {
        search: searchTerm
    };
    
    fetchPGs(filters).then(filteredPGs => {
        renderFilteredPGs(filteredPGs);
        
        // Show notification if no results found
        if (filteredPGs.length === 0) {
            showNotification('No PGs found matching your search', 'info');
        }
    });
}

// Add event listeners for search
searchInput.addEventListener('input', handleSearch);
searchButton.addEventListener('click', handleSearch);

// Update filterPGs function to work with backend
function filterPGs() {
    const location = locationFilter.value;
    const gender = genderFilter.value;
    const facility = facilitiesFilter.value;
    const minPrice = parseInt(minPriceFilter.value) || 0;
    const maxPrice = parseInt(maxPriceFilter.value) || 999999;
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filters = {
        location,
        gender,
        facility,
        minPrice,
        maxPrice,
        search: searchTerm
    };

    fetchPGs(filters).then(filteredPGs => {
        renderFilteredPGs(filteredPGs);
        
        // Show notification if no results found
        if (filteredPGs.length === 0) {
            showNotification('No PGs found matching your filters', 'info');
        }
    });
}

// Update renderFilteredPGs to show search results count
function renderFilteredPGs(filteredPGs) {
    pgsContainer.innerHTML = '';
    
    // Add results count
    const resultsCount = document.createElement('div');
    resultsCount.className = 'results-count';
    resultsCount.innerHTML = `
        <p>Showing ${filteredPGs.length} of ${pgs.length} PGs</p>
    `;
    pgsContainer.appendChild(resultsCount);
    
    filteredPGs.forEach(pg => {
        const pgCard = document.createElement('div');
        pgCard.className = 'pg-card';
        pgCard.innerHTML = `
            <img src="${pg.image}" alt="${pg.name}">
            <div class="pg-card-content">
                <h3>${pg.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${pg.address}</p>
                <p><i class="fas fa-rupee-sign"></i> ${pg.rent}/month</p>
                <p><i class="fas fa-venus-mars"></i> ${pg.gender}</p>
                <div class="facilities">
                    ${pg.facilities.map(facility => `<span>${facility}</span>`).join(' ')}
                </div>
                <div class="pg-action-buttons">
                    <button class="btn primary add-to-wishlist" data-id="${pg.id}">
                        Add to Wishlist
                    </button>
                    <button class="btn secondary book-now" data-id="${pg.id}">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        pgsContainer.appendChild(pgCard);
    });

    // Add event listeners to wishlist buttons
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', (e) => {
            const pgId = parseInt(e.target.dataset.id);
            addToWishlist(pgId);
        });
    });

    // Add event listeners to book now buttons
    document.querySelectorAll('.book-now').forEach(button => {
        button.addEventListener('click', (e) => {
            const pgId = parseInt(e.target.dataset.id);
            bookPg(pgId);
        });
    });
}

// Add event listeners for filters
locationFilter.addEventListener('change', filterPGs);
genderFilter.addEventListener('change', filterPGs);
facilitiesFilter.addEventListener('change', filterPGs);
minPriceFilter.addEventListener('input', filterPGs);
maxPriceFilter.addEventListener('input', filterPGs);

// Update notification colors
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update addToWishlist function to use API
async function addToWishlist(pgId) {
    try {
        const response = await fetch(`/api/wishlist/${pgId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            updateWishlist();
            const pg = pgs.find(p => p.id === pgId);
            showNotification(`${pg.name} added to your wishlist!`);
        } else {
            if (data.error === 'You must be logged in to add to wishlist') {
                showNotification('Please login to add to wishlist', 'error');
                loginModal.style.display = 'block';
            } else {
                showNotification(data.error || 'Failed to add to wishlist', 'error');
            }
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showNotification('Failed to add to wishlist', 'error');
    }
}

// Update Wishlist Display with API
async function updateWishlist() {
    try {
        const response = await fetch('/api/wishlist');
        wishlist = await response.json();
        
        wishlistContainer.innerHTML = '';
        wishlist.forEach(pg => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'pg-card';
            wishlistItem.innerHTML = `
                <img src="${pg.image}" alt="${pg.name}">
                <div class="pg-card-content">
                    <h3>${pg.name}</h3>
                    <p>${pg.address}</p>
                    <button class="btn remove-from-wishlist" data-id="${pg.id}">
                        Remove
                    </button>
                </div>
            `;
            wishlistContainer.appendChild(wishlistItem);
        });

        // Update book tour button
        bookTourBtn.disabled = wishlist.length < 5;
        bookTourBtn.textContent = `Book Tour (${wishlist.length}/5)`;

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-from-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const pgId = parseInt(e.target.dataset.id);
                removeFromWishlist(pgId);
            });
        });
    } catch (error) {
        console.error('Error updating wishlist:', error);
    }
}

// Remove from Wishlist using API
async function removeFromWishlist(pgId) {
    try {
        const response = await fetch(`/api/wishlist/${pgId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            updateWishlist();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to remove from wishlist', 'error');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Failed to remove from wishlist', 'error');
    }
}

// Update bookTour function to use API
bookTourBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/book-tour', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Tour booked successfully! We will contact you shortly to schedule the visits.');
            updateWishlist();
        } else {
            showNotification(data.error || 'Failed to book tour', 'error');
            
            if (data.error === 'You must be logged in to book a tour') {
                loginModal.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error booking tour:', error);
        showNotification('Failed to book tour', 'error');
    }
});

// Login and Signup Functionality
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Handle login form submission with API
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    try {
        // Show a small loading indicator inside the form
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitButton.disabled = true;
        
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        if (response.ok) {
            // Close modal immediately
            loginModal.style.display = 'none';
            
            // Show success notification
            showNotification('Login successful!', 'success');
            
            // Update UI to show logged in state
            updateLoginState();
        } else {
            showNotification(data.error || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Failed to login', 'error');
        
        // Reset button
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Login';
        submitButton.disabled = false;
    }
});

// Handle signup form submission with API
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;
    
    try {
        // Show a small loading indicator inside the form
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing up...';
        submitButton.disabled = true;
        
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        if (response.ok) {
            // Close signup modal immediately
            signupModal.style.display = 'none';
            
            // Show success notification
            showNotification('Signup successful! Please login.', 'success');
            
            // Clear the form
            signupForm.reset();
            
            // Open login modal after a short delay
            setTimeout(() => {
                loginModal.style.display = 'block';
            }, 1000);
        } else {
            showNotification(data.error || 'Failed to register', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Failed to register', 'error');
        
        // Reset button
        const submitButton = signupForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    }
});

// Update login state in UI by checking current user
async function updateLoginState() {
    try {
        const response = await fetch('/api/users/current');
        const currentUser = await response.json();
        
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        
        // Store logged in state to avoid repeated modals
        const wasLoggedIn = document.body.classList.contains('user-logged-in');
        const isLoggedIn = currentUser !== null;
        
        if (isLoggedIn) {
            // User is logged in
            document.body.classList.add('user-logged-in');
            loginBtn.textContent = currentUser.name;
            signupBtn.style.display = 'none';
            
            // Add logout button if it doesn't exist
            if (!document.querySelector('.btn.secondary.logout-btn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'btn secondary logout-btn';
                logoutBtn.textContent = 'Logout';
                logoutBtn.addEventListener('click', handleLogout);
                
                loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
            }
            
            // Only update wishlist if newly logged in
            if (!wasLoggedIn) {
                updateWishlist();
            }
        } else {
            // User is not logged in
            document.body.classList.remove('user-logged-in');
            loginBtn.textContent = 'Login';
            signupBtn.style.display = 'block';
            
            // Remove logout button if it exists
            const logoutBtn = document.querySelector('.btn.secondary.logout-btn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    } catch (error) {
        console.error('Error checking login state:', error);
    }
}

// Handle logout with API
async function handleLogout() {
    try {
        const response = await fetch('/api/users/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Logged out successfully', 'success');
            updateLoginState();
            updateWishlist();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to logout', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Failed to logout', 'error');
    }
}

// Function to book a PG
async function bookPg(pgId) {
    try {
        const response = await fetch(`/api/book-pg/${pgId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show booking confirmation popup instead of notification
            const pg = pgs.find(p => p.id === pgId);
            showBookingConfirmation(pg, data.booking);
        } else {
            if (data.error === 'You must be logged in to book a PG') {
                showNotification('Please login to book a PG', 'error');
                loginModal.style.display = 'block';
            } else {
                showNotification(data.error || 'Failed to book PG', 'error');
            }
        }
    } catch (error) {
        console.error('Error booking PG:', error);
        showNotification('Failed to book PG', 'error');
    }
}

// Show booking confirmation popup
function showBookingConfirmation(pg, booking) {
    // Create booking confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal booking-confirmation';
    modal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const bookingDate = new Date(booking.booked_at);
    const formattedDate = bookingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <div class="booking-success">
            <i class="fas fa-check-circle"></i>
            <h2>Booking Confirmed!</h2>
            <p>You have successfully booked a room at:</p>
            <h3>${pg.name}</h3>
            <div class="booking-details">
                <p><i class="fas fa-map-marker-alt"></i> ${pg.address}</p>
                <p><i class="fas fa-calendar-check"></i> Booked on: ${formattedDate}</p>
                <p><i class="fas fa-rupee-sign"></i> Rent: ₹${pg.rent}/month</p>
            </div>
            <div class="booking-actions">
                <a href="/bookings" class="btn primary">View My Bookings</a>
                <button class="btn secondary close-modal">Continue Browsing</button>
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking the X or close button
    const closeBtn = modal.querySelector('.close');
    const continueBtn = modal.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    continueBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // First load the PGs
    renderPGs();
    
    // Check login state
    updateLoginState();
    
    // Load wishlist if logged in
    updateWishlist();
}); 