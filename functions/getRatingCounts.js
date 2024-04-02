const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

const admin = require('./admin');

exports.getRatingCounts = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        // Enable CORS for cross-origin requests (if your function is called from a web app)
        res.set('Access-Control-Allow-Origin', '*');

        // Ensure GET request
        if (req.method !== 'GET') {
            res.status(400).send('Please send a GET request');
            return;
        }

        try {
            const { location: locationStr, hour: hourStr } = req.query;
            const location = parseInt(locationStr);
            const hour = parseInt(hourStr);
            console.log("Getting rating counts for location", location, "at hour", hour, "...")

            // Validate inputs
            if (!validateInputs(location, hour)) {
                res.status(400).send('Invalid input');
                return;
            }

            // Get ratings
            const db = admin.firestore();
            const ratingsRef = db.collection('rating');
            const snapshot = await ratingsRef.where('location', '==', location).where('hour', '==', hour).get();

            // Calculate counts
            const counts = Array(6).fill(0);
            snapshot.forEach(doc => {
                const rating = doc.data().rating;
                counts[rating]++;
            });

            res.status(200).send(counts);
        } catch (error) {
            console.error('Error getting rating counts:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

function validateInputs(location, hour) {
    if (isNaN(location) || location < 0 || location > 4) {
        console.log('Invalid location!', location, "of type", typeof location);
        return false;
    }

    if (isNaN(hour) || hour < 0) {
        console.log('Invalid hour!', hour, "of type", typeof hour);
        return false;
    }

    return true;
}
