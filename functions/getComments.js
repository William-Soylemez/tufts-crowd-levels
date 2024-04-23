const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

const admin = require('./admin');

exports.getComments = functions.https.onRequest(async (req, res) => {
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
            console.log("Getting coments for location", location, "at hour", hour, "...")

            // Validate input
            if (!validateInputs(location, hour)) {
                res.status(400).send('Invalid input');
                return;
            }

            const db = admin.firestore();
            const ratingsRef = db.collection('rating');
            const snapshot = await ratingsRef
                .where('location', '==', location)
                .where('hour', '==', hour)
                .get();
            const comments = [];
            snapshot.forEach(doc => {
                const comment = doc.data().comment;
                const rating = doc.data().rating;
                comments.push({ comment, rating });
            });


            res.status(200).send(comments);
        } catch (error) {
            console.error('Error getting rating counts:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

function validateInputs(location, hour) {

    if (isNaN(location) || location < 0 || location > 40) {
        console.log('Invalid location!', location);
        return false;
    }

    if (isNaN(hour) || hour < 0) {
        console.log('Invalid day!', hour);
        return false;
    }

    return true;
}
