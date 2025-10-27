import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config.js";

function BlockedDatesManager() {
	const [blockedDates, setBlockedDates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);

	// Form state
	const [newDate, setNewDate] = useState("");
	const [reason, setReason] = useState("");
	const [blockType, setBlockType] = useState("allDay"); // "allDay" ou "hours"
	const [selectedHours, setSelectedHours] = useState([]);

	// Toutes les heures disponibles
	const allHours = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

	useEffect(() => {
		loadBlockedDates();
	}, []);

	const loadBlockedDates = async () => {
		try {
			const q = query(collection(db, "blockedDates"), orderBy("date", "asc"));
			const querySnapshot = await getDocs(q);
			const dates = [];

			querySnapshot.forEach((doc) => {
				dates.push({ id: doc.id, ...doc.data() });
			});

			setBlockedDates(dates);
		} catch (error) {
			console.error("Erreur chargement dates bloquées:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleHour = (hour) => {
		if (selectedHours.includes(hour)) {
			setSelectedHours(selectedHours.filter((h) => h !== hour));
		} else {
			setSelectedHours([...selectedHours, hour]);
		}
	};

	const addBlockedDate = async (e) => {
		e.preventDefault();

		if (!newDate) {
			alert("Veuillez sélectionner une date");
			return;
		}

		if (blockType === "hours" && selectedHours.length === 0) {
			alert("Veuillez sélectionner au moins une heure");
			return;
		}

		try {
			const docData = {
				date: newDate,
				reason: reason || "Fermé",
				allDay: blockType === "allDay",
			};

			if (blockType === "hours") {
				docData.blockedHours = selectedHours;
			}

			await addDoc(collection(db, "blockedDates"), docData);

			// Reset form
			setNewDate("");
			setReason("");
			setBlockType("allDay");
			setSelectedHours([]);
			setShowForm(false);

			// Reload
			loadBlockedDates();
			alert("Date bloquée avec succès!");
		} catch (error) {
			console.error("Erreur ajout date:", error);
			alert("Erreur lors de l'ajout");
		}
	};

	const deleteBlockedDate = async (id) => {
		if (!window.confirm("Débloquer cette date?")) return;

		try {
			await deleteDoc(doc(db, "blockedDates", id));
			setBlockedDates(blockedDates.filter((d) => d.id !== id));
			alert("Date débloquée!");
		} catch (error) {
			console.error("Erreur suppression:", error);
			alert("Erreur lors de la suppression");
		}
	};

	if (loading) return <div className="loading">Chargement...</div>;

	return (
		<div className="blocked-dates-manager">
			<div className="section-header">
				<h2>🔒 Dates Bloquées ({blockedDates.length})</h2>
				<button onClick={() => setShowForm(!showForm)} className="add-button">
					{showForm ? "❌ Annuler" : "➕ Bloquer une date"}
				</button>
			</div>

			{showForm && (
				<form onSubmit={addBlockedDate} className="block-date-form">
					<div className="form-group">
						<label>📅 Date à bloquer</label>
						<input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
					</div>

					<div className="form-group">
						<label>💬 Raison (optionnel)</label>
						<input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Congés, Fermé, etc." />
					</div>

					<div className="form-group">
						<label>⏰ Type de blocage</label>
						<div className="radio-group">
							<label>
								<input type="radio" value="allDay" checked={blockType === "allDay"} onChange={(e) => setBlockType(e.target.value)} />
								Toute la journée
							</label>
							<label>
								<input type="radio" value="hours" checked={blockType === "hours"} onChange={(e) => setBlockType(e.target.value)} />
								Heures spécifiques
							</label>
						</div>
					</div>

					{blockType === "hours" && (
						<div className="form-group">
							<label>Sélectionnez les heures à bloquer:</label>
							<div className="hours-grid">
								{allHours.map((hour) => (
									<button key={hour} type="button" onClick={() => toggleHour(hour)} className={`hour-button ${selectedHours.includes(hour) ? "selected" : ""}`}>
										{hour}
									</button>
								))}
							</div>
						</div>
					)}

					<button type="submit" className="submit-btn">
						🔒 Bloquer cette date
					</button>
				</form>
			)}

			<div className="blocked-dates-list">
				{blockedDates.length === 0 ? (
					<p className="no-dates">Aucune date bloquée</p>
				) : (
					blockedDates.map((item) => (
						<div key={item.id} className="blocked-date-card">
							<div className="date-info">
								<h3>
									📅{" "}
									{new Date(item.date + "T00:00:00").toLocaleDateString("fr-FR", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</h3>
								<p className="reason">{item.reason}</p>
								{item.allDay ? (
									<span className="badge all-day">Toute la journée</span>
								) : (
									<div className="blocked-hours">
										<span className="badge">Heures bloquées:</span>
										<div className="hours-list">
											{item.blockedHours?.map((hour) => (
												<span key={hour} className="hour-tag">
													{hour}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
							<button onClick={() => deleteBlockedDate(item.id)} className="unblock-button">
								🔓 Débloquer
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default BlockedDatesManager;
