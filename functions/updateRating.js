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
            const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 0;

            // Step 3: Check if the user has rated in the last hour
            let hour = req.body.hour;
            if (!hour) {
                // Get the current hour
                try {
                    const currentTime = admin.firestore.Timestamp.now();
                    hour = Math.floor(currentTime.toMillis() / (60 * 60 * 1000));
                } catch (error) {
                    hour = 0;
                }
            }

            const db = admin.firestore();
            const ratingRef = db.collection('rating').where('user', '==', userIp)
                            .where('location', '==', location)
                            .where('hour', '==', hour);

            const snapshot = await ratingRef.get();

            let oldRating = 0;

            if (!snapshot.empty) {
                // User has rated in the last hour - update the rating and average
                const oldRatingDoc = snapshot.docs[0];
                await db.collection('rating').doc(oldRatingDoc.id).update({
                    rating: rating,
                    comment: comment
                });

                oldRating = oldRatingDoc.data().rating;
                
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

            
            // Step 4: Update the average rating for the location
            const locationRef = db.collection('averages').where('location', '==', location)
            .where('hour', '==', hour);
            const locationSnapshot = await locationRef.get();

            if (locationSnapshot.empty) {
                // Add new averages for the location
                console.error("No location found")
                await db.collection('averages').add({
                    hour: hour,
                    location: location,
                    submissions: 1,
                    total: rating,
                });
            } else {
                console.error("Location found")
                // Update the averages for the location
                const locationDoc = locationSnapshot.docs[0];
                console.error("Location doc: ", locationDoc.id, locationDoc.data());
                const oldTotal = locationDoc.data().total;
                const newTotal = oldTotal - oldRating + rating;
                
                const oldSubmissions = locationDoc.data().submissions;
                const newSubmissions = oldSubmissions + (oldRating === 0 ? 1 : 0);

                await db.collection('averages').doc(locationDoc.id).update({
                    total: newTotal,
                    submissions: newSubmissions
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
    return (rating >= 0 && rating <= 99 && location >= 1 && location <= 40 && typeof comment === 'string');
}
