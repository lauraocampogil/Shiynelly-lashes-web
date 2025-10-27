import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config.js";
import AdminLogin from "./AdminLogin.jsx";
import BookingsList from "./BookingsList.jsx";
import BlockedDatesManager from "./BlockedDatesManager.jsx";
import "./AdminPanel.css";

function AdminPanel() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("bookings"); // "bookings" ou "blocked"

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
				<h1>👑 Admin Panel - Shiynelly Lashes</h1>
				<div className="admin-nav">
					<button className={`nav-button ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
						📅 Réservations
					</button>
					<button className={`nav-button ${activeTab === "blocked" ? "active" : ""}`} onClick={() => setActiveTab("blocked")}>
						🔒 Dates Bloquées
					</button>
					<button onClick={handleLogout} className="logout-button">
						🚪 Déconnexion
					</button>
				</div>
			</header>

			<main className="admin-content">
				{activeTab === "bookings" && <BookingsList />}
				{activeTab === "blocked" && <BlockedDatesManager />}
			</main>
		</div>
	);
}

export default AdminPanel;
