# SRM Student Management System

A comprehensive full-stack web application for managing student records at SRM University.

## Features

- Student Profile Management
- Subject-wise Attendance Tracking
- Internal Assessment Marks Management
- Study Materials and PYQ Upload/Download
- Defaulter List Generation
- Automated Email Alerts for Low Attendance

## Tech Stack

- **Frontend**: React.js, React Router, Axios, CSS3
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Email Service**: Nodemailer

## Installation

1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Set up environment variables in `server/.env`
4. Start MongoDB service
5. Run the application: `npm run dev`

## Environment Variables

Create a `.env` file in the server directory:

🗂️ Project Structure
srm-college-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, ProtectedRoute)
│   │   ├── context/        # React context (AuthContext)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── uploads/          # File storage
│   ├── utils/            # Utility functions
│   ├── .env
│   ├── server.js
│   └── package.json
└── README.md

🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Developer
Shreyansh - github.com/sd5387

SRM Institute of Science and Technology

B.Tech Computer Science Engineering

🙏 Acknowledgments
SRM University for the project opportunity

MERN stack community for excellent documentation

Tailwind CSS for the amazing utility framework

React community for continuous improvements

⭐ Star this repo if you found it helpful!
