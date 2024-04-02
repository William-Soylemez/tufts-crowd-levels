const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

const admin = require('./admin');

exports.getRatingAverages = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        // Enable CORS for cross-origin requests (if your function is called from a web app)
        res.set('Access-Control-Allow-Origin', '*');

        // Ensure GET request
        if (req.method !== 'GET') {
            res.status(400).send('Please send a GET request');
            return;
        }

        try {
            console.log(req.query);
            const { location: locationStr, hour: hourStr } = req.query;
            const location = parseInt(locationStr);
            const hour = parseInt(hourStr);
            console.log("Getting rating counts for location", location, "at hour", hour, "...")

            // Validate input
            if (!validateInputs(location, hour)) {
                res.status(400).send('Invalid input');
                return;
            }

            // Get ratings
            const db = admin.firestore();
            const ratingsRef = db.collection('rating');
            const snapshot = await ratingsRef.where('location', '==', location).where('hour', '>=', hour).where('hour', '<', hour + 24).get();

            // Calculate counts
            const counts = Array(24).fill(0);
            const sums = Array(24).fill(0);
            snapshot.forEach(doc => {
                const rating = doc.data().rating;
                const currHour = doc.data().hour - hour;
                counts[currHour]++;
                sums[currHour] += rating;
            });

            for (let i = 0; i < 24; i++) {
                if (counts[i] > 0) {
                    sums[i] /= counts[i];
                }
            }

            // Send object with hours mapping to averages
            const result = {};
            for (let i = 0; i < 24; i++) {
                result[hour + i] = sums[i];
            }

            res.status(200).send(result);
        } catch (error) {
            console.error('Error getting rating counts:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

function validateInputs(location, hour) {

    if (isNaN(location) || location < 0 || location > 4) {
        console.log('Invalid location!', location);
        return false;
    }

    if (isNaN(hour) || hour < 0) {
        console.log('Invalid day!', hour);
        return false;
    }

    return true;
}
