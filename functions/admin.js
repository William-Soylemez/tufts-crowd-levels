const admin = require('firebase-admin');

admin.initializeApp();

if (process.env.FUNCTIONS_EMULATOR) {
    admin.firestore().settings({
        host: "localhost:8080",
        ssl: false
    });
}

module.exports = admin;