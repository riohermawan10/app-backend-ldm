const serviceAccount = require('./serviceAccount.json');
const admin = require('firebase-admin');

const db = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://db-ldm.appspot.com"
});

module.exports = db;