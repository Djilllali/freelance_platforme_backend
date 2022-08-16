const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyC7JWEWpJ6Hg-M6kaLqwGAC-tE8wcLNnY8",
  authDomain: "medchat-6dff1.firebaseapp.com",
  databaseURL: "https://medchat-6dff1.firebaseio.com",
  projectId: "medchat-6dff1",
  storageBucket: "medchat-6dff1.appspot.com",
  messagingSenderId: "680197540228",
  appId: "1:680197540228:web:38736638c261e0f537b5d1",
  measurementId: "G-5ZNMLRZWLJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { app, db };
