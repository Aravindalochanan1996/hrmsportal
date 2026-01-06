# HRMS Portal - Full Stack Application

A responsive HRMS (Human Resource Management System) portal built with React, Node.js, and MongoDB. Features include user authentication, profile management, and employee attendance tracking.

## Features

- **User Authentication**
  - User registration and login
  - JWT-based authentication
  - Secure password hashing with bcrypt

- **User Profile Management**
  - Edit personal information
  - Update department and designation
  - Manage address and contact details

- **Attendance Tracking**
  - Daily check-in and check-out
  - Automatic working hours calculation
  - Monthly attendance history with status
  - Attendance summary statistics

- **Responsive Design**
  - Mobile-friendly interface
  - Works on all device sizes
  - Modern gradient UI

## Project Structure

```
HRMS/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── attendance.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── attendanceController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   └── Attendance.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB connection string and JWT secret
# MONGODB_URI=mongodb://localhost:27017/hrms
# JWT_SECRET=your_secure_secret_key
# PORT=5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start MongoDB (if local)

```bash
# On Windows (if installed as service)
net start MongoDB

# Or run mongod command
mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/all` - Get all users

### Attendance
- `POST /api/attendance/check-in` - Check-in for the day
- `POST /api/attendance/check-out` - Check-out for the day
- `GET /api/attendance/today` - Get today's attendance status
- `GET /api/attendance/history?month=MM&year=YYYY` - Get monthly attendance history

## Usage

1. **Register**: Create a new account with first name, last name, email, and password
2. **Login**: Log in with your credentials
3. **Dashboard**: View your daily attendance status and check-in/check-out
4. **Attendance**: View your monthly attendance history and statistics
5. **Profile**: Edit and update your personal information

## Technology Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Vite for build tooling
- CSS3 with responsive design

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

## Features in Detail

### Authentication
- Secure password hashing using bcryptjs
- JWT tokens for stateless authentication
- Token stored in localStorage for persistence
- Protected routes requiring authentication

### Attendance System
- Daily check-in and check-out functionality
- Automatic calculation of working hours
- Status determination (Present, Absent, Half-Day)
- Monthly attendance history with filtering
- Summary statistics for the month

### Profile Management
- Edit all user information
- Form validation
- Error handling with user feedback
- Success notifications

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API endpoints with middleware
- CORS configuration for security
- Input validation

## Responsive Design

- Mobile-first approach
- Flexbox and CSS Grid layouts
- Media queries for different screen sizes
- Touch-friendly buttons and forms
- Hamburger menu for mobile navigation

## Future Enhancements

- Export attendance reports (PDF/Excel)
- Email notifications for attendance
- Leave management system
- Team management
- Admin dashboard
- Analytics and reporting
- Geolocation-based check-in
- Mobile app

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### Backend Not Starting
- Check if port 5000 is available
- Install all dependencies: `npm install`
- Check Node.js version: `node --version`

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Ensure backend is running
- Check API endpoints in network tab

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository.
