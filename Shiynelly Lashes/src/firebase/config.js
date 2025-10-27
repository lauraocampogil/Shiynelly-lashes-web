import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 

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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // NOUVEAU

// Analytics (code existant)
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
