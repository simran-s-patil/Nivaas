from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')

# Secret key for session
app.secret_key = 'findyourpg_secret_key'

# Data storage (in a real app, this would be a database)
USERS_FILE = 'data/users.json'
PGS_FILE = 'data/pgs.json'

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Initialize data files if they don't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump([], f)

if not os.path.exists(PGS_FILE):
    # Initial PG data
    initial_pgs = [
        {
            "id": 1,
            "name": "Sunshine PG",
            "address": "Koramangala, Bangalore",
            "facilities": ["WiFi", "AC", "Laundry", "Food"],
            "rent": 8000,
            "gender": "Female",
            "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            "id": 2,
            "name": "Green Valley PG",
            "address": "Indiranagar, Bangalore",
            "facilities": ["WiFi", "AC", "Laundry", "Food", "Gym"],
            "rent": 9000,
            "gender": "Male",
            "image": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            "id": 3,
            "name": "Royal Residency",
            "address": "Whitefield, Bangalore",
            "facilities": ["WiFi", "AC", "Laundry", "Food", "Parking"],
            "rent": 8500,
            "gender": "Female",
            "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            "id": 4,
            "name": "Cosy Corner",
            "address": "HSR Layout, Bangalore",
            "facilities": ["WiFi", "AC", "Laundry", "Food", "TV Room"],
            "rent": 7500,
            "gender": "Male",
            "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        },
        {
            "id": 5,
            "name": "Lavender House",
            "address": "Jayanagar, Bangalore",
            "facilities": ["WiFi", "AC", "Laundry", "Food", "Study Room"],
            "rent": 8200,
            "gender": "Female",
            "image": "https://images.unsplash.com/photo-1507089947368-22c1e77b7813?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
        }
    ]
    with open(PGS_FILE, 'w') as f:
        json.dump(initial_pgs, f)

# Helper functions for data access
def get_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def get_pgs():
    with open(PGS_FILE, 'r') as f:
        return json.load(f)

def save_pgs(pgs):
    with open(PGS_FILE, 'w') as f:
        json.dump(pgs, f)

# Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/owner-portal')
def owner_portal():
    return app.send_static_file('owner-portal.html')

@app.route('/about')
def about():
    return app.send_static_file('about.html')

# API Routes
@app.route('/api/pgs', methods=['GET'])
def get_all_pgs():
    # Get query parameters for filtering
    location = request.args.get('location', '')
    gender = request.args.get('gender', '')
    facility = request.args.get('facility', '')
    min_price = int(request.args.get('min_price', 0))
    max_price = int(request.args.get('max_price', 999999))
    search_term = request.args.get('search', '').lower()
    
    pgs = get_pgs()
    
    # Apply filters
    filtered_pgs = []
    for pg in pgs:
        # Location filter
        if location and location not in pg['address']:
            continue
        
        # Gender filter
        if gender and pg['gender'] != gender:
            continue
        
        # Facility filter
        if facility and facility not in pg['facilities']:
            continue
        
        # Price filter
        if pg['rent'] < min_price or pg['rent'] > max_price:
            continue
        
        # Search term filter
        if search_term:
            name_match = search_term in pg['name'].lower()
            address_match = search_term in pg['address'].lower()
            facilities_match = any(search_term in f.lower() for f in pg['facilities'])
            
            if not (name_match or address_match or facilities_match):
                continue
        
        filtered_pgs.append(pg)
    
    return jsonify(filtered_pgs)

@app.route('/api/pgs', methods=['POST'])
def add_pg():
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to list a PG'}), 401
    
    data = request.json
    pgs = get_pgs()
    
    # Create a new PG object
    new_pg = {
        'id': len(pgs) + 1,
        'name': data['name'],
        'address': data['address'],
        'facilities': data['facilities'],
        'rent': data['rent'],
        'gender': data['gender'],
        'image': data['image'],
        'owner': {
            'id': session['user_id'],
            'name': data['owner']['name'],
            'contact': data['owner']['contact'],
            'email': data['owner']['email']
        },
        'created_at': datetime.now().isoformat()
    }
    
    pgs.append(new_pg)
    save_pgs(pgs)
    
    return jsonify(new_pg), 201

@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    users = get_users()
    
    # Check if email already exists
    for user in users:
        if user['email'] == data['email']:
            return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    new_user = {
        'id': len(users) + 1,
        'name': data['name'],
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'wishlist': [],
        'created_at': datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_users(users)
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    users = get_users()
    
    for user in users:
        if user['email'] == data['email'] and check_password_hash(user['password'], data['password']):
            # Set session
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            
            return jsonify({
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            })
    
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/users/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/users/current', methods=['GET'])
def current_user():
    if not session.get('user_id'):
        return jsonify(None)
    
    users = get_users()
    user = next((u for u in users if u['id'] == session['user_id']), None)
    
    if user:
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'wishlist': user['wishlist']
        })
    
    return jsonify(None)

@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    if not session.get('user_id'):
        return jsonify([])
    
    users = get_users()
    user = next((u for u in users if u['id'] == session['user_id']), None)
    
    if not user:
        return jsonify([])
    
    pgs = get_pgs()
    wishlist_pgs = [pg for pg in pgs if pg['id'] in user['wishlist']]
    
    return jsonify(wishlist_pgs)

@app.route('/api/wishlist/<int:pg_id>', methods=['POST'])
def add_to_wishlist(pg_id):
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to add to wishlist'}), 401
    
    users = get_users()
    
    for i, user in enumerate(users):
        if user['id'] == session['user_id']:
            if pg_id not in user['wishlist']:
                user['wishlist'].append(pg_id)
                save_users(users)
            return jsonify({'message': 'Added to wishlist'})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/wishlist/<int:pg_id>', methods=['DELETE'])
def remove_from_wishlist(pg_id):
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to remove from wishlist'}), 401
    
    users = get_users()
    
    for i, user in enumerate(users):
        if user['id'] == session['user_id']:
            if pg_id in user['wishlist']:
                user['wishlist'].remove(pg_id)
                save_users(users)
            return jsonify({'message': 'Removed from wishlist'})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/book-tour', methods=['POST'])
def book_tour():
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to book a tour'}), 401
    
    users = get_users()
    
    for i, user in enumerate(users):
        if user['id'] == session['user_id']:
            # Check if wishlist has at least 5 PGs
            if len(user['wishlist']) < 5:
                return jsonify({'error': 'You need at least 5 PGs in your wishlist to book a tour'}), 400
            
            # Clear wishlist after booking
            user['wishlist'] = []
            save_users(users)
            
            return jsonify({'message': 'Tour booked successfully'})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/book-pg/<int:pg_id>', methods=['POST'])
def book_pg(pg_id):
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to book a PG'}), 401
    
    users = get_users()
    pgs = get_pgs()
    
    # Find the PG
    pg = next((p for p in pgs if p['id'] == pg_id), None)
    if not pg:
        return jsonify({'error': 'PG not found'}), 404
    
    # Find the user
    user = next((u for u in users if u['id'] == session['user_id']), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user already has bookings
    if not 'bookings' in user:
        user['bookings'] = []
    
    # Add booking
    booking = {
        'pg_id': pg_id,
        'pg_name': pg['name'],
        'booked_at': datetime.now().isoformat(),
        'status': 'confirmed'
    }
    
    user['bookings'].append(booking)
    save_users(users)
    
    return jsonify({
        'message': f'You have successfully booked {pg["name"]}!',
        'booking': booking
    })

@app.route('/api/users/bookings', methods=['GET'])
def get_user_bookings():
    if not session.get('user_id'):
        return jsonify([])
    
    users = get_users()
    user = next((u for u in users if u['id'] == session['user_id']), None)
    
    if not user or 'bookings' not in user:
        return jsonify([])
    
    return jsonify(user['bookings'])

@app.route('/api/book-pg/<int:pg_id>', methods=['DELETE'])
def cancel_booking(pg_id):
    if not session.get('user_id'):
        return jsonify({'error': 'You must be logged in to cancel a booking'}), 401
    
    users = get_users()
    
    for i, user in enumerate(users):
        if user['id'] == session['user_id']:
            if 'bookings' not in user:
                return jsonify({'error': 'No bookings found'}), 404
            
            # Find and remove the booking
            user['bookings'] = [b for b in user['bookings'] if b['pg_id'] != pg_id]
            save_users(users)
            
            return jsonify({'message': 'Booking cancelled successfully'})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/bookings')
def bookings_page():
    return app.send_static_file('bookings.html')

# Run the app
if __name__ == '__main__':
    app.run(debug=True) 