import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCyYlEomkWIQ-dQeT5-zrLlL_YP-2iFW08",
	authDomain: "shiynelly-lashes.firebaseapp.com",
	projectId: "shiynelly-lashes",
	storageBucket: "shiynelly-lashes.firebasestorage.app",
	messagingSenderId: "753067897077",
	appId: "1:753067897077:web:6478e1936121d108ec55bc",
	measurementId: "G-FR2YC35HHN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Fonction helper pour logger des événements
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
	logEvent(analytics, eventName, eventParams);
};
