import firebase from 'firebase';

const app = firebase.initializeApp({
  apiKey: 'AIzaSyCE8Bl996F4DTUIXq2d25a5QgsMqazuT7g',
  authDomain: 'firegram-62656.firebaseapp.com',
  databaseURL: 'https://firegram-62656.firebaseio.com',
  projectId: 'firegram-62656',
  storageBucket: 'firegram-62656.appspot.com',
  messagingSenderId: '370835404388',
  appId: '1:370835404388:web:94b86fa21b30c12b655171',
});

// Must be in this order
const db = app.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
