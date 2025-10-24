import { logAnalyticsEvent } from "./firebase/config.js";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import NosPrestations from "./components/NosPrestations.jsx";
import Reservation from "./components/Reservation.jsx";
import Footer from "./components/Footer.jsx";

function App() {
	useEffect(() => {
		try {
			// Track page view au chargement
			if (typeof logAnalyticsEvent === "function") {
				logAnalyticsEvent("page_view", {
					page_title: document.title,
					page_location: window.location.href,
				});
			}
		} catch (error) {
			console.error("Analytics error:", error);
		}
	}, []);
	return (
		<>
			<Navbar />
			<Hero />
			<NosPrestations />
			<Reservation />
			<Footer />
		</>
	);
}

export default App;
