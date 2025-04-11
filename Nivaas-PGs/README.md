# Find Your PG - Web Application

A web application for finding and listing PG (Paying Guest) accommodations.

## Features

- Browse PGs with filters (location, gender, price, facilities)
- Search functionality to find PGs by name, location, or facilities
- User registration and login
- Wishlist to save favorite PGs
- Book a tour to visit multiple PGs
- Owner portal to list new PGs

## Backend Technology

- Flask (Python web framework)
- JSON file-based storage
- RESTful API

## Frontend Technology

- HTML5, CSS3, JavaScript
- Responsive design

## Installation and Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/find-your-pg.git
cd find-your-pg
```

2. Install the required dependencies:
```
pip install -r requirements.txt
```

3. Run the application:
```
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## API Endpoints

- GET `/api/pgs` - Get all PGs with optional filters
- POST `/api/pgs` - Add a new PG
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login a user
- POST `/api/users/logout` - Logout a user
- GET `/api/users/current` - Get current logged-in user
- GET `/api/wishlist` - Get user's wishlist
- POST `/api/wishlist/<pg_id>` - Add PG to wishlist
- DELETE `/api/wishlist/<pg_id>` - Remove PG from wishlist
- POST `/api/book-tour` - Book a tour for wishlist PGs

## Project Structure

- `app.py` - Flask application and API routes
- `index.html` - Main page
- `owner-portal.html` - PG owner listing page
- `script.js` - Main JavaScript file
- `owner-portal.js` - PG owner portal JavaScript
- `styles.css` - Stylesheet
- `data/` - Directory for JSON data storage
  - `users.json` - User data
  - `pgs.json` - PG data 