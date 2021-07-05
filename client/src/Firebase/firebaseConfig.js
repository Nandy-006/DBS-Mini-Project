import firebase from 'firebase/app';
import 'firebase/storage';

const firebaseConfig = {
	apiKey: 'AIzaSyAUp0fXZULb-53iI1dXLjYrma2s_aCPmzQ',
	authDomain: 'dbs-mini-project.firebaseapp.com',
	projectId: 'dbs-mini-project',
	storageBucket: 'dbs-mini-project.appspot.com',
	messagingSenderId: '806792490571',
	appId: '1:806792490571:web:37d6f03f3816b4ebb1e7ce',
	measurementId: 'G-THQ0HDXSXY'
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export { storage, firebase as default };
