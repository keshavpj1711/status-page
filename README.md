# Status Page Application

## Overview

This application is a simplified version of a status page service similar to StatusPage, Cachet, or Betterstack. It allows administrators to manage services and their statuses, and provides a public-facing page for users to view the current status of all services.

## Live Demo

**Hosted Application**: [Status Page App](https://status-page-inky.vercel.app/login/)

**Demo Credentials**:
- Email: hello@gmail.com
- Password: 123456

## Features Implemented

### User Authentication
- Secure email/password authentication using Firebase Auth
- Protected routes for authenticated users
- Login and registration functionality
- User session management

### Service Management
- Complete CRUD operations for services:
  - Create new services with name and initial status
  - Read/view all services with their current status
  - Update service status (Operational, Degraded Performance, Partial Outage, Major Outage)
  - Delete services with confirmation dialog
- Visual indicators for different service statuses
- Real-time updates when service status changes

### Incident Management
- Full CRUD functionality for incidents:
  - Create incidents with title, description, status, and affected services
  - View incident details including timeline of updates
  - Update incidents with new status information
  - Resolve incidents when issues are fixed
- Incident timeline showing the progression of status updates
- Visual status indicators for different incident states

### Real-time Updates
- Implemented Firebase's onSnapshot listeners for real-time data synchronization
- Status changes appear immediately without page refresh
- Timeline updates in real-time as new information is added

### Public Status Page
- Accessible to all users without authentication
- Displays current status of all services
- Shows active incidents with their details
- Presents a timeline of recent incidents and status changes
- Overall system status indicator based on service health

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Authentication
- **Hosting**: Vercel
- **Real-time Updates**: Firestore onSnapshot listeners

## Project Structure

The application follows a component-based architecture with the following main components:

- **Authentication**: Login and Registration components
- **Dashboard**: Main interface for authenticated users
- **ServiceManagement**: CRUD interface for services
- **Incident Management**: Components for creating and managing incidents
- **PublicStatusPage**: Public-facing status dashboard

## Future Enhancements

While not implemented in the current version due to time constraints, the following features are planned for future releases:

- Multi-user collaboration with team management
- Organization/multi-tenant support
- WebSocket implementation for even more responsive real-time updates
- Email notifications for status changes
- Metric graphs for service uptime percentage
- API for external status checks

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Firebase configuration
4. Run the development server with `npm start`
5. Access the application at `http://localhost:3000`

## Acknowledgments

This project was created as part of a technical assignment, focusing on implementing core status page functionality with a clean, minimalist UI. The application demonstrates proficiency in React, Firebase, real-time data synchronization, and responsive design.
