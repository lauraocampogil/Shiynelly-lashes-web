import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config.js";
import AdminLogin from "./AdminLogin.jsx";
import BookingsList from "./BookingsList.jsx";
import BlockedDatesManager from "./BlockedDatesManager.jsx";
import WeeklyAvailability from "./WeeklyAvailability.jsx";
import ToggleModelService from "./ToggleModelService.jsx";
import "./AdminPanel.css";
import "./AdminPanelMobile.css";

function AdminPanel() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("bookings");

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error("Erreur déconnexion:", error);
		}
	};

	if (loading) {
		return <div className="loading">Chargement...</div>;
	}

	if (!user) {
		return <AdminLogin onLoginSuccess={() => setUser(auth.currentUser)} />;
	}

	return (
		<div className="admin-panel">
			<header className="admin-header">
				<h1>Admin Panel - Shiynelly Lashes</h1>
				<div className="admin-nav">
					<button className={`nav-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
						<i className="fa-solid fa-calendar-check"></i> Réservations
					</button>
					<button className={`nav-btn ${activeTab === "weekly" ? "active" : ""}`} onClick={() => setActiveTab("weekly")}>
						<i className="fa-solid fa-calendar"></i> Jours d'ouverture
					</button>
					<button className={`nav-btn ${activeTab === "blocked" ? "active" : ""}`} onClick={() => setActiveTab("blocked")}>
						<i className="fa-solid fa-lock"></i> Dates Bloquées
					</button>
					<button className={`nav-btn ${activeTab === "toggle-model" ? "active" : ""}`} onClick={() => setActiveTab("toggle-model")}>
						<i className="fa-solid fa-toggle-on"></i> Service Modèle
					</button>
					<button onClick={handleLogout} className="logout-button">
						<i className="fa-solid fa-arrow-right-from-bracket"></i> Déconnexion
					</button>
				</div>
			</header>

			<main className="admin-content">
				{activeTab === "bookings" && <BookingsList />}
				{activeTab === "weekly" && <WeeklyAvailability />}
				{activeTab === "blocked" && <BlockedDatesManager />}
				{activeTab === "toggle-model" && <ToggleModelService />}
			</main>
		</div>
	);
}

export default AdminPanel;
