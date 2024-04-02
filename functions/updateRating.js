/***********************************************
 * TODOs
 *  1. Change data validation (dynamic number of locations?)
 *  2. Make new average collection, update there instead (for performance)
 *  3. Make new comment collection, update there instead 
***********************************************/

const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

const admin = require('./admin');

exports.updateRating = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        // Enable CORS for cross-origin requests (if your function is called from a web app)
        res.set('Access-Control-Allow-Origin', "*");

        if (req.method !== 'POST') {
            return res.status(403).send('Forbidden!');
        }

        try {
            // Step 1: Validate request body
            console.log("Body: ", req.body, "Type: ", typeof req.body);
            const { location, rating, comment } = req.body;
            console.log(`Updating rating for location ${location} to ${rating}`);
            if (!validateRatingAndLocation(rating, location, comment)) {
                return res.status(400).send('Invalid input');
            }

            // Step 2: Get user's IP address
            const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            // Step 3: Check if the user has rated in the last hour
            const currentTime = admin.firestore.Timestamp.now();
            const hour = Math.floor(currentTime.toMillis() / (60 * 60 * 1000));
            
            const db = admin.firestore();
            const ratingRef = db.collection('rating').where('user', '==', userIp)
                            .where('location', '==', location)
                            .where('hour', '==', hour);

            const snapshot = await ratingRef.get();

            if (!snapshot.empty) {
                // User has rated in the last hour - update the rating and average
                const oldRatingDoc = snapshot.docs[0];
                await db.collection('rating').doc(oldRatingDoc.id).update({
                    rating: rating,
                    comment: comment
                });
            } else {
                // User has not rated in the last hour - add new rating
                await db.collection('rating').add({
                    user: userIp,
                    location: location,
                    rating: rating,
                    hour: hour,
                    comment: comment
                });
            }

            res.status(200).send('Rating updated successfully');
        } catch (error) {
            console.error('Error updating rating:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

function validateRatingAndLocation(rating, location, comment) {
    return (rating >= 0 && rating <= 99 && location >= 1 && location <= 5 && typeof comment === 'string');
}
