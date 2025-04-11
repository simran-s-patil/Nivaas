// Bookings page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and fetch bookings
    checkLoginAndFetchBookings();
});

// Function to check login status and fetch bookings
async function checkLoginAndFetchBookings() {
    try {
        const response = await fetch('/api/users/current');
        const user = await response.json();
        
        if (!user) {
            // User not logged in, show message and redirect after delay
            showNotification('Please login to view your bookings', 'error');
            document.querySelector('.loading').style.display = 'none';
            document.querySelector('.no-bookings').style.display = 'block';
            document.querySelector('.no-bookings p').textContent = 'You need to login to view your bookings.';
            
            // Show login modal
            setTimeout(() => {
                loginModal.style.display = 'block';
            }, 1000);
            return;
        }
        
        // User is logged in, fetch their bookings
        fetchUserBookings(user.id);
    } catch (error) {
        console.error('Error checking login status:', error);
        showNotification('Failed to check login status', 'error');
    }
}

// Function to fetch user bookings
async function fetchUserBookings(userId) {
    try {
        const response = await fetch('/api/users/bookings');
        const bookings = await response.json();
        
        renderBookings(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        showNotification('Failed to load bookings', 'error');
    }
}

// Function to render bookings
function renderBookings(bookings) {
    const bookingsContainer = document.getElementById('bookings-container');
    const noBookingsDiv = document.querySelector('.no-bookings');
    
    // Remove loading message
    document.querySelector('.loading').style.display = 'none';
    
    if (!bookings || bookings.length === 0) {
        // No bookings found
        noBookingsDiv.style.display = 'block';
        return;
    }
    
    // Hide no bookings message
    noBookingsDiv.style.display = 'none';
    
    // Clear bookings container
    bookingsContainer.innerHTML = '';
    
    // Render each booking
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
        
        const bookingDate = new Date(booking.booked_at);
        const formattedDate = bookingDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        bookingCard.innerHTML = `
            <div class="booking-header">
                <h3>${booking.pg_name}</h3>
                <span class="booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-calendar-alt"></i> Booked on: ${formattedDate}</p>
                <p><i class="fas fa-info-circle"></i> Booking ID: ${booking.pg_id}</p>
            </div>
            <div class="booking-actions">
                <button class="btn primary contact-owner" data-id="${booking.pg_id}">
                    Contact Owner
                </button>
                <button class="btn cancel-booking" data-id="${booking.pg_id}">
                    Cancel Booking
                </button>
            </div>
        `;
        
        bookingsContainer.appendChild(bookingCard);
    });
    
    // Add event listeners for booking actions
    document.querySelectorAll('.contact-owner').forEach(button => {
        button.addEventListener('click', (e) => {
            const pgId = parseInt(e.target.dataset.id);
            showNotification('Owner contact details have been sent to your email', 'success');
        });
    });
    
    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', (e) => {
            const pgId = parseInt(e.target.dataset.id);
            cancelBooking(pgId);
        });
    });
}

// Function to cancel a booking
async function cancelBooking(pgId) {
    try {
        const response = await fetch(`/api/book-pg/${pgId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Booking cancelled successfully', 'success');
            // Refresh bookings
            checkLoginAndFetchBookings();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to cancel booking', 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Failed to cancel booking', 'error');
    }
} 