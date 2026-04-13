# AIRLINE TICKET BOOKING SYSTEM

## 1. Project Overview

The Airline Ticket Booking System is a comprehensive web application developed based on the Online Travel Agent (OTA) model. This application provides an end-to-end solution ranging from flight searching and dynamic seat selection to online payment processing, and post-booking operations such as online check-in and electronic ticket (E-Ticket) distribution via email.

The project is designed with a modern, user-friendly interface and a highly secure backend system. It is specifically engineered to handle complex database concurrency issues, such as Race Conditions, ensuring data integrity even under high-traffic scenarios.

## 2. Key Features

### For Customers (End-Users)
* Flight Search Engine: Flexible search capabilities for both one-way and round-trip flights based on departure dates and destinations.
* Dynamic Seat Map: Visual representation of the aircraft layout. Seat statuses (available/booked) are updated in real-time.
* Flexible Pricing: Automated fare calculation based on the selected seat class (Business, Premium Economy, Economy).
* Online Payment Integration: Secure and seamless checkout process integrated with the VNPay gateway.
* Electronic Ticketing (E-Ticket): Automated generation and delivery of flight details and PNR codes via email immediately upon successful payment.
* Online Check-in: Allows users to verify their information and generate a digital Boarding Pass prior to departure.
* Profile Management: Users can view transaction history, request cancellations (refunds), and submit post-flight quality reviews.

### For Administrators
* Analytics Dashboard: Provides a high-level overview of total revenue, booking volumes, and user metrics.
* Booking Management: Monitor the complete transaction flow, manually approve bookings, and process cancellation requests.
* Core Data Management: Create, read, update, and delete information regarding Airports, Airlines, and Flight Schedules.

## 3. Technologies Used

### Frontend
* React.js: Utilized for building a highly interactive user interface (bootstrapped with Vite).
* Tailwind CSS: A utility-first CSS framework for implementing responsive and modern UI/UX designs across all devices.
* React Router DOM: For secure and efficient client-side routing.

### Backend
* Node.js & Express.js: Used to construct a robust and highly performant RESTful API server.
* MongoDB & Mongoose: A NoSQL database management system for flexible storage of flight and user data.
* JSON Web Token (JWT): Implemented for secure user authentication and role-based access control.
* Nodemailer: An SMTP protocol integration for automating confirmation email deliveries.

## 4. System Architecture & Technical Highlights

* Race Condition Handling: Implemented MongoDB's Atomic Updates (using findOneAndUpdate combined with condition operators) to guarantee that two customers cannot successfully book the same seat in the exact same millisecond.
* Rollback Mechanism: Ensures data integrity for round-trip bookings. If the system successfully reserves the outbound seat but fails to secure the return seat (due to concurrency), the outbound seat is automatically released.
* Double Callback (IPN) Prevention: Strictly handles redundant webhook signals from the payment gateway, ensuring that orders are updated and confirmation emails are dispatched only once per transaction.

## 5. Installation & Setup Guide

### System Prerequisites
* Node.js (Version v16.x or higher)
* MongoDB (Local installation or MongoDB Atlas cluster)
* Git

### Installation Steps

Step 1: Clone the repository
```bash
git clone https://github.com/pmt204/Airline_Ticket_Booking_System.git
cd Airline_Ticket_Booking_System
```

Step 2: Install Backend dependencies
```bash
cd backend
npm install
```

Step 3: Install Frontend dependencies
```bash
cd ../frontend
npm install
```

Step 4: Configure Environment Variables
Create a `.env` file in the `backend` directory and provide the necessary credentials as specified in the section below.

Step 5: Run the Application
* Start the Backend server (Default port: 5000):
```bash
cd backend
npm run dev
```

* Start the Frontend server (Default port: 5173):
```bash
cd frontend
npm run dev
```

### Environment Variables (.env)

Create a file named `.env` inside the `backend` directory and include the following variables:

```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

## 6. Author

* Pham Minh Thanh
* Software Engineering Student - Ho Chi Minh City University of Technology (HUTECH)

This project was developed for academic research purposes and to simulate the real-world operational workflows of online travel agency systems. The repository remains open to constructive feedback and contributions to further improve the system architecture.
