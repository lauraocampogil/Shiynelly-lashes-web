import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "VOTRE_API_KEY",
	authDomain: "votre-projet.firebaseapp.com",
	projectId: "votre-projet-id",
	storageBucket: "votre-projet.appspot.com",
	messagingSenderId: "123456789",
	appId: "1:123456789:web:abc123",
	measurementId: "G-XXXXXXXXXX",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let analytics = null;
isSupported().then((yes) => {
	if (yes) {
		analytics = getAnalytics(app);
	}
});

export const logAnalyticsEvent = (eventName, eventParams = {}) => {
	try {
		if (analytics) {
			logEvent(analytics, eventName, eventParams);
		}
	} catch (error) {
		console.warn("Analytics event failed:", error);
	}
};
