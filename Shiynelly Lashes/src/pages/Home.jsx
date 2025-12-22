import { logAnalyticsEvent } from "../firebase/config.js";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import NosPrestations from "../components/NosPrestations.jsx";
import Reservation from "../components/Reservation.jsx";
import Footer from "../components/Footer.jsx";

function App() {
	const [showModal, setShowModal] = useState(false);

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

		// Show price announcement modal
		const hasSeenAnnouncement = sessionStorage.getItem("hasSeenPriceAnnouncement");
		if (!hasSeenAnnouncement) {
			setTimeout(() => {
				setShowModal(true);
			}, 1000);
		}
	}, []);

	const handleCloseModal = () => {
		setShowModal(false);
		sessionStorage.setItem("hasSeenPriceAnnouncement", "true");
	};
	const handleBookingClick = () => {
		handleCloseModal();
		// Scroll to reservation section
		setTimeout(() => {
			const reservationSection = document.getElementById("reservation");
			if (reservationSection) {
				reservationSection.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 300);
	};

	return (
		<>
			{/* Price Announcement Modal */}
			{showModal && (
				<>
					<div className="modal-overlay" onClick={handleCloseModal}></div>
					<div className="price-modal">
						<button className="modal-close" onClick={handleCloseModal} aria-label="Fermer">
							<i className="fas fa-times"></i>
						</button>

						<div className="modal-content">
							<div className="modal-icon">
								<i className="fas fa-info-circle"></i>
							</div>

							<h2>Information Importante</h2>

							<p className="modal-message">
								À partir du <strong>1er janvier 2026</strong>, nos tarifs évolueront pour refléter la qualité de nos prestations.
							</p>

							<div className="modal-highlight">
								<i className="fas fa-calendar-alt"></i>
								<span>Profitez de nos tarifs actuels jusqu'au 31 décembre 2025 !</span>
							</div>

							<button className="modal-cta" onClick={handleBookingClick}>
								<i className="far fa-calendar-check"></i>
								Prendre Rendez-vous
							</button>

							<button className="modal-secondary" onClick={handleCloseModal}>
								J'ai compris
							</button>
						</div>
					</div>
				</>
			)}

			<Navbar />
			<Hero />
			<NosPrestations />
			<Reservation />
			<Footer />
		</>
	);
}

export default App;
