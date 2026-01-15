import { useState, useRef, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import emailjs from "@emailjs/browser";
import { services } from "../../constants/index.js";
import { db, logAnalyticsEvent } from "../firebase/config.js";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";

function BookingForm() {
	const form = useRef();
	const [formData, setFormData] = useState({
		prenom: "",
		nom: "",
		email: "",
		telephone: "",
		service: "",
		date: "",
		heure: "",
		commentaires: "",
	});

	const [selectedDate, setSelectedDate] = useState(null);
	const [availableSlots, setAvailableSlots] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [weeklySchedule, setWeeklySchedule] = useState(null);
	const [availableServices, setAvailableServices] = useState([]);
	const [blockedDatesCache, setBlockedDatesCache] = useState([]);
	const [exceptionalOpenDates, setExceptionalOpenDates] = useState([]);
	const [debugInfo, setDebugInfo] = useState("En attente...");

	// ✅ FONCTION HELPER - Formate une date en string YYYY-MM-DD sans conversion UTC
	const formatDateToString = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	useEffect(() => {
		loadWeeklySchedule();
		checkModelServiceStatus();
		loadBlockedDates();
	}, []);

	const checkModelServiceStatus = async () => {
		try {
			const docRef = doc(db, "settings", "modelService");
			const docSnap = await getDoc(docRef);

			const isOpen = docSnap.exists() ? docSnap.data().isOpen : false;

			const filtered = services.filter((service) => {
				if (service.isModelService && !isOpen) {
					return false;
				}
				return true;
			});

			setAvailableServices(filtered);
		} catch (error) {
			console.error("Erreur vérification service modèle:", error);
			setAvailableServices(services.filter((s) => !s.isModelService));
		}
	};

	const loadWeeklySchedule = async () => {
		try {
			const docRef = doc(db, "settings", "weeklySchedule");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setWeeklySchedule(docSnap.data());
			} else {
				setWeeklySchedule({
					monday: { open: false, label: "Lundi" },
					tuesday: { open: false, label: "Mardi" },
					wednesday: { open: false, label: "Mercredi" },
					thursday: { open: false, label: "Jeudi" },
					friday: { open: false, label: "Vendredi" },
					saturday: { open: true, label: "Samedi" },
					sunday: { open: true, label: "Dimanche" },
				});
			}
		} catch (error) {
			console.error("Erreur chargement planning:", error);
			setWeeklySchedule({
				monday: { open: false, label: "Lundi" },
				tuesday: { open: false, label: "Mardi" },
				wednesday: { open: false, label: "Mercredi" },
				thursday: { open: false, label: "Jeudi" },
				friday: { open: false, label: "Vendredi" },
				saturday: { open: true, label: "Samedi" },
				sunday: { open: true, label: "Dimanche" },
			});
		}
	};

	// Charger toutes les dates bloquées et exceptionnelles au démarrage
	const loadBlockedDates = async () => {
		try {
			const q = query(collection(db, "blockedDates"));
			const querySnapshot = await getDocs(q);

			const blocked = [];
			const exceptional = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (data.actionType === "open") {
					exceptional.push(data.date);
				} else if (data.allDay) {
					blocked.push(data.date);
				}
			});

			setBlockedDatesCache(blocked);
			setExceptionalOpenDates(exceptional);
		} catch (error) {
			console.error("Erreur chargement dates bloquées:", error);
		}
	};

	const isDayOpen = (date) => {
		if (!weeklySchedule) return false;

		const dayIndex = date.getDay();

		const dayMap = {
			0: "sunday",
			1: "monday",
			2: "tuesday",
			3: "wednesday",
			4: "thursday",
			5: "friday",
			6: "saturday",
		};

		const dayKey = dayMap[dayIndex];
		return weeklySchedule[dayKey]?.open ?? false;
	};

	// ✅ CORRIGÉ - Fonction pour react-datepicker : filtrer les dates disponibles
	const isDateAvailable = (date) => {
		const dateString = formatDateToString(date); // ← Correction ici

		// Vérifier si la date est exceptionnellement ouverte
		if (exceptionalOpenDates.includes(dateString)) {
			return true;
		}

		// Vérifier si la date est bloquée
		if (blockedDatesCache.includes(dateString)) {
			return false;
		}

		// Vérifier le planning hebdomadaire
		return isDayOpen(date);
	};

	const isSlotAvailable = async (date, startTime, duration) => {
		try {
			const [hours, minutes] = startTime.split(":").map(Number);
			const startMinutes = hours * 60 + minutes;
			const endMinutes = startMinutes + duration;

			const q = query(collection(db, "reservations"), where("date", "==", date));
			const querySnapshot = await getDocs(q);

			for (const doc of querySnapshot.docs) {
				const booking = doc.data();
				const [bookingHours, bookingMinutes] = booking.heure.split(":").map(Number);
				const bookingStart = bookingHours * 60 + bookingMinutes;
				const bookingEnd = bookingStart + booking.duration;

				if ((startMinutes >= bookingStart && startMinutes < bookingEnd) || (endMinutes > bookingStart && endMinutes <= bookingEnd) || (startMinutes <= bookingStart && endMinutes >= bookingEnd)) {
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error("Erreur lors de la vérification de disponibilité:", error);
			return false;
		}
	};

	const getBlockedHours = async (date) => {
		try {
			const q = query(collection(db, "blockedDates"), where("date", "==", date), where("allDay", "==", false));
			const querySnapshot = await getDocs(q);

			let blockedHours = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (data.blockedHours && Array.isArray(data.blockedHours)) {
					blockedHours = [...blockedHours, ...data.blockedHours];
				}
			});

			return blockedHours;
		} catch (error) {
			console.error("Erreur récupération heures bloquées:", error);
			return [];
		}
	};

	const generateTimeSlots = useCallback(async (serviceDuration, selectedDate) => {
		if (!selectedDate) return [];

		const slots = [];
		const startMorning = 9 * 60;
		const endMorning = 13.5 * 60;
		const startAfternoon = 14 * 60;
		const endAfternoon = 19 * 60;

		const blockedHours = await getBlockedHours(selectedDate);

		const allSlots = [];

		for (let time = startMorning; time + serviceDuration <= endMorning; time += 30) {
			const hours = Math.floor(time / 60);
			const minutes = time % 60;
			const slot = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

			if (!blockedHours.includes(slot)) {
				allSlots.push(slot);
			}
		}

		for (let time = startAfternoon; time + serviceDuration <= endAfternoon; time += 30) {
			const hours = Math.floor(time / 60);
			const minutes = time % 60;
			const slot = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

			if (!blockedHours.includes(slot)) {
				allSlots.push(slot);
			}
		}

		for (const slot of allSlots) {
			//const available = await isSlotAvailable(selectedDate, slot, serviceDuration);
			//if (available) {
			slots.push(slot);
			//}
		}

		return slots;
	}, []);

	const handleServiceChange = async (e) => {
		const serviceId = e.target.value;
		const selectedService = availableServices.find((s) => s.id === serviceId);

		if (selectedService) {
			logAnalyticsEvent("service_selected", {
				service_name: selectedService.name,
				service_price: selectedService.price,
			});
		}

		setFormData({ ...formData, service: serviceId, heure: "" });
		setAvailableSlots([]);

		if (selectedService && formData.date) {
			const slots = await generateTimeSlots(selectedService.duration, formData.date);
			setAvailableSlots(slots);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// ✅ CORRIGÉ - Handle date selection from react-datepicker
	const handleDateChange = async (date) => {
		if (!date) {
			setSelectedDate(null);
			setFormData({ ...formData, date: "", heure: "" });
			setAvailableSlots([]);
			return;
		}

		setSelectedDate(date);
		const dateString = formatDateToString(date); // ← Correction ici

		// IMPORTANT : Mettre à jour formData AVANT de générer les slots
		const newFormData = { ...formData, date: dateString, heure: "" };
		setFormData(newFormData);

		logAnalyticsEvent("date_selected", {
			selected_date: dateString,
		});

		// Utiliser newFormData.service au lieu de formData.service
		if (newFormData.service) {
			const selectedService = availableServices.find((s) => s.id === newFormData.service);
			if (selectedService) {
				const slots = await generateTimeSlots(selectedService.duration, dateString);
				setAvailableSlots(slots);
			}
		}
	};

	// useEffect pour générer les slots quand service ou date change
	useEffect(() => {
		const generateSlotsForSelectedDate = async () => {
			if (formData.service && formData.date && availableServices.length > 0) {
				const selectedService = availableServices.find((s) => s.id === formData.service);
				if (selectedService) {
					setDebugInfo("Génération en cours...");
					try {
						const slots = await generateTimeSlots(selectedService.duration, formData.date);
						setDebugInfo(`Terminé: ${slots.length} slots trouvés`);
						setAvailableSlots(slots);
					} catch (error) {
						setDebugInfo(`ERREUR: ${error.message}`);
					}
				} else {
					setDebugInfo("Service non trouvé");
				}
			} else {
				setDebugInfo(`Conditions non remplies: service=${formData.service}, date=${formData.date}, services=${availableServices.length}`);
			}
		};

		generateSlotsForSelectedDate();
	}, [formData.service, formData.date, availableServices, generateTimeSlots]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.date) {
			alert("Veuillez sélectionner une date");
			return;
		}

		setIsSubmitting(true);

		const selectedService = availableServices.find((s) => s.id === formData.service);

		logAnalyticsEvent("booking_started", {
			service: selectedService.name,
			service_price: selectedService.price,
			date: formData.date,
		});

		const available = await isSlotAvailable(formData.date, formData.heure, selectedService.duration);
		if (!available) {
			logAnalyticsEvent("booking_slot_unavailable", {
				service: selectedService.name,
				requested_date: formData.date,
				requested_time: formData.heure,
			});

			alert("Désolé, ce créneau vient d'être réservé. Veuillez en choisir un autre.");
			setIsSubmitting(false);
			const slots = await generateTimeSlots(selectedService.duration, formData.date);
			setAvailableSlots(slots);
			return;
		}

		try {
			await addDoc(collection(db, "reservations"), {
				prenom: formData.prenom,
				nom: formData.nom,
				email: formData.email,
				telephone: formData.telephone,
				service: selectedService.name,
				serviceId: formData.service,
				date: formData.date,
				heure: formData.heure,
				duration: selectedService.duration,
				commentaires: formData.commentaires,
				timestamp: new Date(),
				price: selectedService.price,
				isModelBooking: selectedService.isModelService || false,
			});

			const templateParams = {
				to_name: formData.prenom,
				from_name: `${formData.prenom} ${formData.nom}`,
				client_email: formData.email,
				client_phone: formData.telephone,
				service_name: `${selectedService.name} - ${selectedService.price}`,
				appointment_date: new Date(formData.date).toLocaleDateString("fr-FR", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				}),
				appointment_time: formData.heure,
				comments: formData.commentaires || "Aucun",
				address: "60 bd Pasteur 94260 - Sonner à Demoniere, prendre le 2ème ascenseur près des escaliers, sortir à gauche, sonner porte L",
				instructions: "Venez avec les cils propres et démaquillés. Attention : présence de deux chats au domicile.",
			};

			await emailjs.send("service_4t9ude2", "template_z26jqp7", templateParams, "vSn8lOsAhAksc03kS");
			await emailjs.send("service_4t9ude2", "template_8smxy0b", templateParams, "vSn8lOsAhAksc03kS");

			logAnalyticsEvent("purchase", {
				transaction_id: `booking_${Date.now()}`,
				value: parseFloat(selectedService.price.replace("€", "")),
				currency: "EUR",
				items: [
					{
						item_id: selectedService.id,
						item_name: selectedService.name,
						price: parseFloat(selectedService.price.replace("€", "")),
					},
				],
			});

			logAnalyticsEvent("booking_completed", {
				service_name: selectedService.name,
				service_id: selectedService.id,
				service_price: selectedService.price,
				booking_date: formData.date,
				booking_time: formData.heure,
				client_email: formData.email,
			});

			alert("Rendez-vous confirmé! Vous allez recevoir un email de confirmation.");

			setFormData({
				prenom: "",
				nom: "",
				email: "",
				telephone: "",
				service: "",
				date: "",
				heure: "",
				commentaires: "",
			});
			setSelectedDate(null);
			setAvailableSlots([]);
		} catch (error) {
			console.error("Erreur:", error);

			logAnalyticsEvent("booking_error", {
				error_message: error.message,
				service: selectedService.name,
				date: formData.date,
				time: formData.heure,
			});

			alert("Une erreur est survenue. Veuillez réessayer.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getOpenDaysText = () => {
		if (!weeklySchedule) return "";

		const openDays = [];
		const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

		daysOrder.forEach((day) => {
			if (weeklySchedule[day]?.open) {
				openDays.push(weeklySchedule[day].label);
			}
		});

		if (openDays.length === 0) return "Aucun jour d'ouverture configuré";
		if (openDays.length === 1) return openDays[0];
		if (openDays.length === 2) return `${openDays[0]} et ${openDays[1]}`;

		const lastDay = openDays.pop();
		return `${openDays.join(", ")} et ${lastDay}`;
	};

	const maxBookingDate = new Date();
	maxBookingDate.setFullYear(maxBookingDate.getFullYear() + 2);

	return (
		<div className="booking-container" id="reservation">
			<form ref={form} onSubmit={handleSubmit} className="booking-form">
				<div className="form-row">
					<div className="form-group">
						<label htmlFor="prenom">Prénom </label>
						<input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
					</div>

					<div className="form-group">
						<label htmlFor="nom">Nom </label>
						<input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="email">Email </label>
					<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
				</div>

				<div className="form-group">
					<label htmlFor="telephone">Téléphone </label>
					<input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} required />
				</div>

				<div className="form-group">
					<label htmlFor="service">
						<i className="fas fa-sparkles"></i> Service souhaité
					</label>
					<div className="select-wrapper">
						<select id="service" name="service" value={formData.service} onChange={handleServiceChange} required>
							<option value="">Choisir un service</option>
							{availableServices.map((service) => (
								<option key={service.id} value={service.id}>
									{service.name} - {service.price}
								</option>
							))}
						</select>
						<i className="fas fa-chevron-down select-arrow"></i>
					</div>
					{formData.service && <p className="service-description">{availableServices.find((s) => s.id === formData.service)?.description}</p>}
				</div>

				<div className="form-group">
					<label htmlFor="date">
						<i className="far fa-calendar-alt"></i> Date souhaitée
					</label>
					{weeklySchedule && (
						<p className="opening-days-info">
							<i className="fas fa-info-circle"></i> Jours d'ouverture: <strong>{getOpenDaysText()}</strong>
						</p>
					)}
					<div className="date-input-container">
						<DatePicker
							selected={selectedDate}
							onChange={handleDateChange}
							filterDate={isDateAvailable}
							minDate={new Date()}
							maxDate={maxBookingDate}
							locale={fr}
							dateFormat="dd/MM/yyyy"
							placeholderText="Sélectionner une date"
							className="date-picker-input"
							inline={false}
							required
						/>
						<i className="fas fa-calendar-alt date-calendar-icon"></i>
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="heure">
						<i className="far fa-clock"></i> Heure préférée
					</label>
					<div className="select-wrapper">
						<select
							id="heure"
							name="heure"
							value={formData.heure}
							onChange={handleChange}
							disabled={!formData.service || !formData.date || availableSlots.length === 0}
							key={`slots-${formData.date}-${formData.service}-${availableSlots.join(",")}`} // ← CLÉ PLUS SPÉCIFIQUE
							required
						>
							<option value="">
								{!formData.date
									? "Choisir d'abord une date"
									: !formData.service
									? "Choisir d'abord un service"
									: availableSlots.length === 0
									? "Chargement des créneaux..." // ← Message différent
									: "Choisir un créneau"}
							</option>
							{availableSlots.map((slot) => (
								<option key={slot} value={slot}>
									{slot}
								</option>
							))}
						</select>
						<i className="fas fa-chevron-down select-arrow"></i>
					</div>
				</div>

				{/* DEBUG BOX - À SUPPRIMER APRÈS TEST */}
				<div style={{ background: "yellow", padding: "10px", margin: "10px 0", border: "2px solid red" }}>
					<p>
						<strong>DEBUG INFO:</strong>
					</p>
					<p>Service: {formData.service || "AUCUN"}</p>
					<p>Date: {formData.date || "AUCUNE"}</p>
					<p>Date sélectionnée (objet): {selectedDate ? formatDateToString(selectedDate) : "NULL"}</p>
					<p>Créneaux: {availableSlots.length}</p>
					<p>Liste: {availableSlots.join(", ") || "VIDE"}</p>
					<p>Services chargés: {availableServices.length}</p>
					<p>Service trouvé: {availableServices.find((s) => s.id === formData.service)?.name || "NON TROUVÉ"}</p>
					<p>Duration: {availableServices.find((s) => s.id === formData.service)?.duration || "?"}</p>
					<p style={{ color: "blue", fontWeight: "bold" }}>Debug génération: {debugInfo}</p>
				</div>

				<div className="form-group">
					<label htmlFor="commentaires">Commentaires ou demandes spéciales</label>
					<textarea id="commentaires" name="commentaires" value={formData.commentaires} onChange={handleChange} rows="4" placeholder="Première fois ? Allergies ? Préférences particulières ?" />
				</div>

				<div className="info-box">
					<h4>
						<i className="fas fa-info-circle"></i> Informations importantes:
					</h4>
					<ul>
						<li>Venez avec les cils propres et démaquillés</li>
						<li>Attention: présence de deux chats au domicile</li>
					</ul>
				</div>

				<button type="submit" className="submit-button" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<i className="fas fa-spinner fa-spin"></i> Envoi en cours...
						</>
					) : (
						<>
							<i className="far fa-calendar-check"></i> Confirmer le Rendez-vous
						</>
					)}
				</button>
			</form>
		</div>
	);
}

export default BookingForm;
