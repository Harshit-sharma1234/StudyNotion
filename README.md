# StudyNotion Edtech Project
# StudyNotion - EdTech Platform 📚

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

StudyNotion is a fully functional Ed-tech platform built with the MERN stack. It enables users to create, consume, and rate educational content. The platform is designed for both learners and instructors, providing a seamless and interactive learning experience.

## 🚀 Live Demo

You can view the live project here: [**StudyNotion Live Link**](https://your-live-project-link.com)

## 📸 Screenshots

Here are a few snapshots of the application in action:

*(A screenshot of your homepage)*

*(A screenshot of a course page)*

*(A screenshot of the user dashboard)*


## ✨ Features

- **User Authentication:** Secure login and signup functionality with OTP verification and password reset options.
- **Course Management:** Instructors can create, update, and manage courses, including video lectures and pricing.
- **Student Enrollment:** Students can browse courses, purchase them using a payment gateway (like Razorpay), and access course content.
- **Progress Tracking:** Students can track their progress through courses.
- **Cloud-based Media:** Uses Cloudinary for efficient video and image management.
- **Responsive Design:** A user-friendly interface that works on all devices.

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Redux for State Management
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)

**APIs / Services:**
- Cloudinary for media storage
- Razorpay for payment integration
- Nodemailer for sending emails

## ⚙️ Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have Node.js and npm (or yarn) installed on your system.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Harshit-sharma1234/StudyNotion.git](https://github.com/Harshit-sharma1234/StudyNotion.git)
    cd StudyNotion
    ```

2.  **Install backend dependencies:**
    ```sh
    cd server
    npm install
    ```

3.  **Install frontend dependencies:**
    ```sh
    cd ../client
    npm install
    ```

### Environment Variables

To run this project, you will need to add the following environment variables to a `.env` file in the `server` directory.

Create a `.env` file in `/server` and add the following:
