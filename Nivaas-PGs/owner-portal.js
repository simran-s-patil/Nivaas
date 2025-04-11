// Handle PG Listing Form Submission
document.getElementById('pg-listing-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const pgName = document.getElementById('pg-name').value;
    const pgAddress = document.getElementById('pg-address').value;
    const pgRent = parseInt(document.getElementById('pg-rent').value);
    const pgGender = document.getElementById('pg-gender').value;
    const pgImage = document.getElementById('pg-image').value;
    const ownerName = document.getElementById('owner-name').value;
    const ownerContact = document.getElementById('owner-contact').value;
    const ownerEmail = document.getElementById('owner-email').value;
    
    // Get selected facilities
    const facilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Create new PG object
    const newPG = {
        name: pgName,
        address: pgAddress,
        facilities: facilities,
        rent: pgRent,
        gender: pgGender,
        image: pgImage,
        owner: {
            name: ownerName,
            contact: ownerContact,
            email: ownerEmail
        }
    };
    
    try {
        const response = await fetch('/api/pgs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPG)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('PG listed successfully!', 'success');
            // Reset form
            e.target.reset();
        } else {
            if (data.error === 'You must be logged in to list a PG') {
                showNotification('You must be logged in to list a PG. Redirecting to login...', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showNotification(data.error || 'Failed to list PG', 'error');
            }
        }
    } catch (error) {
        console.error('Error listing PG:', error);
        showNotification('Failed to list PG. Please try again.', 'error');
    }
});

// Function to check login status
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/users/current');
        const user = await response.json();
        
        if (!user) {
            showNotification('Please login to list your PG.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

// Function to show notifications
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkLoginStatus();
}); 