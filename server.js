const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Setup the file-based database (will create db.json)
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set initial database structure if it doesn't exist
db.defaults({ syncedVitals: [] }).write();

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allows your front-end HTML files to communicate with this server
app.use(bodyParser.json()); // Parses incoming JSON requests

// Serve Static Files (Your HTML, CSS, JS)
// This allows you to access your app via http://localhost:3000/health-tracker.html
app.use(express.static('.'));

// ------------------------------------------------------------------
// API ENDPOINT: POST /api/sync-vitals
// Receives the patient's vital logs from their local IndexedDB.
// ------------------------------------------------------------------
app.post('/api/sync-vitals', (req, res) => {
    const offlineData = req.body.vitals;

    if (!offlineData || offlineData.length === 0) {
        return res.status(400).json({ message: 'No vital records provided for sync.' });
    }

    // **REAL-WORLD LOGIC:**
    // 1. Authenticate the user (check token/session).
    // 2. Add patient ID and doctor ID context.
    // 3. Save records to a proper database (PostgreSQL/MongoDB).

    // PROTOTYPE LOGIC (LowDB): Add all new vitals to the 'syncedVitals' collection
    db.get('syncedVitals')
      .push(...offlineData)
      .write();

    console.log(`✅ Synced ${offlineData.length} new logs to the central database.`);

    // Respond with success message
    res.status(200).json({ 
        message: `Sync successful: ${offlineData.length} records processed.`, 
        totalRecords: db.get('syncedVitals').value().length
    });
});

// ------------------------------------------------------------------
// API ENDPOINT: GET /api/vitals
// For doctors or the patient dashboard to retrieve synced data.
// ------------------------------------------------------------------
app.get('/api/vitals', (req, res) => {
    const allVitals = db.get('syncedVitals').value();
    res.status(200).json(allVitals);
});

// Start the server
app.listen(port, () => {
    console.log(`\n🚀 TeleMed Nabha Backend running at http://localhost:${port}`);
    console.log(`Access the App at: http://localhost:${port}/health-tracker.html\n`);
});