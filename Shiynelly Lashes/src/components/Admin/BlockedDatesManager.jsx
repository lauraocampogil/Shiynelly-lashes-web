import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";

function BlockedDatesManager() {
	const [blockedDates, setBlockedDates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);

	// Form state
	const [actionType, setActionType] = useState("block"); // "block" ou "open"
	const [blockMode, setBlockMode] = useState("single"); // "single" ou "range"
	const [newDate, setNewDate] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
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
			console.error("Erreur chargement dates:", error);
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

	// Générer toutes les dates entre startDate et endDate
	const getDatesBetween = (start, end) => {
		const dates = [];
		const currentDate = new Date(start + "T00:00:00");
		const lastDate = new Date(end + "T00:00:00");

		while (currentDate <= lastDate) {
			dates.push(currentDate.toISOString().split("T")[0]);
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return dates;
	};

	const addBlockedDate = async (e) => {
		e.preventDefault();

		let datesToProcess = [];

		// Mode période
		if (blockMode === "range") {
			if (!startDate || !endDate) {
				alert("Veuillez sélectionner une date de début et de fin");
				return;
			}
			if (new Date(startDate) > new Date(endDate)) {
				alert("La date de début doit être avant la date de fin");
				return;
			}
			datesToProcess = getDatesBetween(startDate, endDate);
		} else {
			// Mode date unique
			if (!newDate) {
				alert("Veuillez sélectionner une date");
				return;
			}
			datesToProcess = [newDate];
		}

		if (blockType === "hours" && selectedHours.length === 0 && actionType === "block") {
			alert("Veuillez sélectionner au moins une heure");
			return;
		}

		try {
			// Créer un document pour chaque date
			const promises = datesToProcess.map(async (date) => {
				const docData = {
					date: date,
					reason: reason || (actionType === "open" ? "Ouvert exceptionnellement" : "Fermé"),
					allDay: blockType === "allDay",
					actionType: actionType, // "block" ou "open"
				};

				if (blockType === "hours") {
					docData.blockedHours = selectedHours;
				}

				// Ajouter info de période si c'est un range
				if (blockMode === "range") {
					docData.isRange = true;
					docData.rangeStart = startDate;
					docData.rangeEnd = endDate;
				}

				return addDoc(collection(db, "blockedDates"), docData);
			});

			await Promise.all(promises);

			// Reset form
			setNewDate("");
			setStartDate("");
			setEndDate("");
			setReason("");
			setBlockType("allDay");
			setSelectedHours([]);
			setBlockMode("single");
			setActionType("block");
			setShowForm(false);

			// Reload
			loadBlockedDates();
			alert(`${datesToProcess.length} date(s) ${actionType === "open" ? "ouverte(s)" : "bloquée(s)"} avec succès!`);
		} catch (error) {
			console.error("Erreur ajout date:", error);
			alert("Erreur lors de l'ajout: " + error.message);
		}
	};

	const deleteBlockedDate = async (id) => {
		if (!window.confirm("Supprimer cette date?")) return;

		try {
			await deleteDoc(doc(db, "blockedDates", id));
			setBlockedDates(blockedDates.filter((d) => d.id !== id));
			alert("Date supprimée!");
		} catch (error) {
			console.error("Erreur suppression:", error);
			alert("Erreur lors de la suppression");
		}
	};

	// Supprimer toute une période
	const deleteRange = async (rangeStart, rangeEnd) => {
		if (!window.confirm(`Supprimer toutes les dates du ${rangeStart} au ${rangeEnd}?`)) return;

		try {
			const rangeDates = blockedDates.filter((d) => d.isRange && d.rangeStart === rangeStart && d.rangeEnd === rangeEnd);

			const promises = rangeDates.map((d) => deleteDoc(doc(db, "blockedDates", d.id)));
			await Promise.all(promises);

			setBlockedDates(blockedDates.filter((d) => !(d.isRange && d.rangeStart === rangeStart && d.rangeEnd === rangeEnd)));

			alert(`Période supprimée (${rangeDates.length} dates)!`);
		} catch (error) {
			console.error("Erreur suppression:", error);
			alert("Erreur lors de la suppression");
		}
	};

	// Grouper les dates par période
	const groupByRange = () => {
		const ranges = {};
		const singles = [];

		blockedDates.forEach((item) => {
			if (item.isRange) {
				const key = `${item.rangeStart}_${item.rangeEnd}_${item.reason}_${item.actionType}`;
				if (!ranges[key]) {
					ranges[key] = {
						rangeStart: item.rangeStart,
						rangeEnd: item.rangeEnd,
						reason: item.reason,
						allDay: item.allDay,
						blockedHours: item.blockedHours,
						actionType: item.actionType,
						dates: [],
					};
				}
				ranges[key].dates.push(item);
			} else {
				singles.push(item);
			}
		});

		return { ranges: Object.values(ranges), singles };
	};

	if (loading) return <div className="loading">Chargement...</div>;

	const { ranges, singles } = groupByRange();

	// Séparer les dates bloquées et ouvertes
	const blockedRanges = ranges.filter((r) => r.actionType === "block" || !r.actionType);
	const openRanges = ranges.filter((r) => r.actionType === "open");
	const blockedSingles = singles.filter((s) => s.actionType === "block" || !s.actionType);
	const openSingles = singles.filter((s) => s.actionType === "open");

	return (
		<div className="blocked-dates-manager">
			<div className="section-header">
				<h2>
					<i className="fa-solid fa-lock"></i> Gestion des Dates ({blockedDates.length})
				</h2>
				<button onClick={() => setShowForm(!showForm)} className="add-button">
					{showForm ? (
						<>
							<i className="fa-solid fa-xmark"></i> Annuler
						</>
					) : (
						<>
							<i className="fa-solid fa-plus"></i> Ajouter une date
						</>
					)}
				</button>
			</div>

			{showForm && (
				<form onSubmit={addBlockedDate} className="block-date-form">
					<div className="form-group">
						<label>
							<i className="fa-solid fa-toggle-on"></i> Action
						</label>
						<div className="radio-group">
							<label className="radio-label-primary">
								<input type="radio" value="block" checked={actionType === "block"} onChange={(e) => setActionType(e.target.value)} />
								<span className="block-badge">
									<i className="fa-solid fa-lock"></i> Bloquer (Fermer)
								</span>
							</label>
							<label className="radio-label-success">
								<input type="radio" value="open" checked={actionType === "open"} onChange={(e) => setActionType(e.target.value)} />
								<span className="open-badge">
									<i className="fa-solid fa-circle-check"></i> Ouvrir exceptionnellement
								</span>
							</label>
						</div>
						<p className="help-text">{actionType === "block" ? " Fermez des dates normalement ouvertes (ex: vacances, week-end de Noël)" : "Ouvrez des dates normalement fermées (ex: vendredi exceptionnel)"}</p>
					</div>

					<div className="form-group">
						<label>
							<i className="fa-solid fa-calendar"></i> Mode de sélection
						</label>
						<div className="radio-group">
							<label>
								<input type="radio" value="single" checked={blockMode === "single"} onChange={(e) => setBlockMode(e.target.value)} />
								Date unique
							</label>
							<label>
								<input type="radio" value="range" checked={blockMode === "range"} onChange={(e) => setBlockMode(e.target.value)} />
								Période (plusieurs jours)
							</label>
						</div>
					</div>

					{blockMode === "single" ? (
						<div className="form-group">
							<label>
								<i className="fa-solid fa-calendar-day"></i> Date à {actionType === "open" ? "ouvrir" : "bloquer"}
							</label>
							<input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
						</div>
					) : (
						<div className="form-row">
							<div className="form-group">
								<label>
									<i className="fa-solid fa-calendar-day"></i> Date de début
								</label>
								<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
							</div>
							<div className="form-group">
								<label>
									<i className="fa-solid fa-calendar-day"></i> Date de fin
								</label>
								<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
							</div>
						</div>
					)}

					<div className="form-group">
						<label>
							<i className="fa-solid fa-comment"></i> Raison
						</label>
						<input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={actionType === "open" ? "Ex: Vendredi exceptionnel, Jour férié compensé" : "Ex: Congés d'été, Vacances de Noël"} />
					</div>

					{actionType === "block" && (
						<>
							<div className="form-group">
								<label>
									<i className="fa-solid fa-clock"></i> Type de blocage
								</label>
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
						</>
					)}

					<button type="submit" className={`submit-button ${actionType === "open" ? "submit-open" : "submit-block"}`}>
						{actionType === "open" ? (
							<>
								<i className="fa-solid fa-lock-open"></i> Ouvrir {blockMode === "range" ? "cette période" : "cette date"}
							</>
						) : (
							<>
								<i className="fa-solid fa-lock"></i> Bloquer {blockMode === "range" ? "cette période" : "cette date"}
							</>
						)}
					</button>
				</form>
			)}

			<div className="blocked-dates-list">
				{/* Dates OUVERTES exceptionnellement */}
				{(openRanges.length > 0 || openSingles.length > 0) && (
					<div className="open-section">
						<h3>
							<i className="fa-solid fa-lock-open"></i> Dates Ouvertes Exceptionnellement
						</h3>

						{/* Périodes ouvertes */}
						{openRanges.length > 0 &&
							openRanges.map((range, index) => (
								<div key={index} className="open-range-card">
									<div className="date-info">
										<h3>
											<i className="fa-solid fa-calendar-days"></i> Du {new Date(range.rangeStart + "T00:00:00").toLocaleDateString("fr-FR")} au {new Date(range.rangeEnd + "T00:00:00").toLocaleDateString("fr-FR")}
										</h3>
										<p className="reason">{range.reason}</p>
										<p className="date-count">{range.dates.length} jour(s) ouvert(s)</p>
										<span className="badge open-badge">
											<i className="fa-solid fa-circle-check"></i> Ouvert
										</span>
									</div>
									<button onClick={() => deleteRange(range.rangeStart, range.rangeEnd)} className="delete-button">
										<i className="fa-solid fa-trash-can"></i> Supprimer
									</button>
								</div>
							))}

						{/* Dates uniques ouvertes */}
						{openSingles.length > 0 &&
							openSingles.map((item) => (
								<div key={item.id} className="open-date-card">
									<div className="date-info">
										<h3>
											<i className="fa-solid fa-calendar-day"></i>{" "}
											{new Date(item.date + "T00:00:00").toLocaleDateString("fr-FR", {
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</h3>
										<p className="reason">{item.reason}</p>
										<span className="badge open-badge">
											<i className="fa-solid fa-circle-check"></i> Ouvert
										</span>
									</div>
									<button onClick={() => deleteBlockedDate(item.id)} className="delete-button">
										<i className="fa-solid fa-trash-can"></i> Supprimer
									</button>
								</div>
							))}
					</div>
				)}

				{/* Dates BLOQUÉES */}
				{(blockedRanges.length > 0 || blockedSingles.length > 0) && (
					<div className="blocked-section">
						<h3>
							<i className="fa-solid fa-lock"></i> Dates Bloquées
						</h3>

						{/* Périodes bloquées */}
						{blockedRanges.length > 0 &&
							blockedRanges.map((range, index) => (
								<div key={index} className="blocked-range-card">
									<div className="date-info">
										<h3>
											<i className="fa-solid fa-calendar-days"></i> Du {new Date(range.rangeStart + "T00:00:00").toLocaleDateString("fr-FR")} au {new Date(range.rangeEnd + "T00:00:00").toLocaleDateString("fr-FR")}
										</h3>
										<p className="reason">{range.reason}</p>
										<p className="date-count">{range.dates.length} jour(s) bloqué(s)</p>
										{range.allDay ? (
											<span className="badge all-day">Toute la journée</span>
										) : (
											<div className="blocked-hours">
												<span className="badge">Heures bloquées:</span>
												<div className="hours-list">
													{range.blockedHours?.map((hour) => (
														<span key={hour} className="hour-tag">
															{hour}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
									<button onClick={() => deleteRange(range.rangeStart, range.rangeEnd)} className="delete-button">
										<i className="fa-solid fa-trash-can"></i> Supprimer
									</button>
								</div>
							))}

						{/* Dates uniques bloquées */}
						{blockedSingles.length > 0 &&
							blockedSingles.map((item) => (
								<div key={item.id} className="blocked-date-card">
									<div className="date-info">
										<h3>
											<i className="fa-solid fa-calendar-day"></i>{" "}
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
									<button onClick={() => deleteBlockedDate(item.id)} className="delete-button">
										<i className="fa-solid fa-trash-can"></i> Supprimer
									</button>
								</div>
							))}
					</div>
				)}

				{blockedDates.length === 0 && <p className="no-dates">Aucune date configurée</p>}
			</div>
		</div>
	);
}

export default BlockedDatesManager;
