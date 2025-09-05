# Amberflux Screen Recorder Backend

This folder contains the backend code for the Amberflux Screen Recorder project.

## Structure
- `src/` - Source code for the backend server
  - `app.js` - Main application file
  - `server.js` - Server entry point
  - `config/db.js` - Database configuration
  - `models/Recording.js` - Mongoose model for recordings
  - `routes/recordings.js` - API routes for recordings
  - `uploads/` - Directory for storing uploaded recordings
- `recordings.db` - Database file (if using SQLite or similar)
- `package.json` - Backend dependencies and scripts

## Setup
1. Install dependencies:
   ```powershell
   cd backend
   npm install
   ```
2. Start the backend server:
   ```powershell
   npm start
   ```

## API Endpoints
- `/api/recordings` - Manage recordings (CRUD operations)

## Notes
- Ensure MongoDB (or configured DB) is running before starting the server.
- Uploaded files are stored in the `uploads/` directory.

---
For more details, see the main project README.
