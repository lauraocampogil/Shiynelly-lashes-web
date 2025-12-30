import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

function WeeklyAvailability() {
	const [weeklySchedule, setWeeklySchedule] = useState({
		monday: { open: false, label: "Lundi" },
		tuesday: { open: false, label: "Mardi" },
		wednesday: { open: false, label: "Mercredi" },
		thursday: { open: false, label: "Jeudi" },
		friday: { open: false, label: "Vendredi" },
		saturday: { open: true, label: "Samedi" },
		sunday: { open: true, label: "Dimanche" },
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadWeeklySchedule();
	}, []);

	const loadWeeklySchedule = async () => {
		try {
			const docRef = doc(db, "settings", "weeklySchedule");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setWeeklySchedule((prev) => ({
					...prev,
					...data,
				}));
			}
		} catch (error) {
			console.error("Erreur chargement planning hebdomadaire:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleDay = async (day) => {
		const newSchedule = {
			...weeklySchedule,
			[day]: {
				...weeklySchedule[day],
				open: !weeklySchedule[day].open,
			},
		};

		setWeeklySchedule(newSchedule);

		try {
			setSaving(true);
			await setDoc(doc(db, "settings", "weeklySchedule"), newSchedule);
			alert(`${newSchedule[day].label} ${newSchedule[day].open ? "ouvert" : "fermé"}!`);
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
			alert("Erreur lors de la sauvegarde");
			// Rollback
			setWeeklySchedule(weeklySchedule);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="loading">Chargement...</div>;

	const openDaysCount = Object.values(weeklySchedule).filter((d) => d.open).length;
	const closedDaysCount = 7 - openDaysCount;

	return (
		<div className="weekly-availability">
			<div className="section-header">
				<h2>
					<i className="fa-solid fa-calendar"></i> Jours d'ouverture
				</h2>
				<p className="subtitle">Sélectionnez les jours où vous acceptez des rendez-vous</p>
			</div>

			{openDaysCount === 0 && (
				<div className="warning-box">
					<i className="fa-solid fa-triangle-exclamation"></i>
					<strong>Attention:</strong> Aucun jour n'est ouvert. Les clients ne pourront pas réserver.
				</div>
			)}

			<div className="days-grid">
				{Object.entries(weeklySchedule).map(([day, info]) => (
					<div key={day} className={`day-card ${info.open ? "open" : "closed"}`}>
						<div className="day-info">
							<h3>{info.label}</h3>
							<span className={`status ${info.open ? "open" : "closed"}`}>
								{info.open ? (
									<>
										<i className="fa-solid fa-circle-check"></i> Ouvert
									</>
								) : (
									<>
										<i className="fa-solid fa-circle-xmark"></i> Fermé
									</>
								)}
							</span>
						</div>
						<button onClick={() => toggleDay(day)} disabled={saving} className={`toggle-button ${info.open ? "close" : "open"}`}>
							{info.open ? (
								<>
									<i className="fa-solid fa-xmark"></i> Fermer
								</>
							) : (
								<>
									<i className="fa-solid fa-check"></i> Ouvrir
								</>
							)}
						</button>
					</div>
				))}
			</div>

			<div className="summary-card">
				<h3>
					<i className="fa-solid fa-chart-simple"></i> Résumé
				</h3>
				<div className="summary-content">
					<div className="summary-item">
						<span className="label">Jours ouverts:</span>
						<span className="value open">
							{openDaysCount} jour{openDaysCount > 1 ? "s" : ""}
						</span>
					</div>
					<div className="summary-item">
						<span className="label">Jours fermés:</span>
						<span className="value closed">
							{closedDaysCount} jour{closedDaysCount > 1 ? "s" : ""}
						</span>
					</div>
				</div>
			</div>

			<div className="info-box">
				<p>
					<i className="fa-solid fa-lightbulb"></i> <strong>Comment ça marche:</strong>
				</p>
				<ul>
					<li>Par défaut, tous les jours sont fermés</li>
					<li>Ouvrez uniquement les jours où vous travaillez</li>
					<li>Les clients ne pourront réserver QUE sur les jours ouverts</li>
					<li>Pour bloquer une date spécifique (vacances), utilisez l'onglet "Dates Bloquées"</li>
				</ul>
			</div>
		</div>
	);
}

export default WeeklyAvailability;
