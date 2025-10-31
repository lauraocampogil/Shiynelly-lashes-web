import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { services } from "../../constants/index.js";
import { db, logAnalyticsEvent } from "../firebase/config.js";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

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

	const [availableSlots, setAvailableSlots] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fonction pour vérifier si un créneau est disponible
	const isSlotAvailable = async (date, startTime, duration) => {
		try {
			const [hours, minutes] = startTime.split(":").map(Number);
			const startMinutes = hours * 60 + minutes;
			const endMinutes = startMinutes + duration;

			// Récupérer toutes les réservations pour cette date
			const q = query(collection(db, "reservations"), where("date", "==", date));
			const querySnapshot = await getDocs(q);

			// Vérifier les conflits
			for (const doc of querySnapshot.docs) {
				const booking = doc.data();
				const [bookingHours, bookingMinutes] = booking.heure.split(":").map(Number);
				const bookingStart = bookingHours * 60 + bookingMinutes;
				const bookingEnd = bookingStart + booking.duration;

				// Vérifier si les créneaux se chevauchent
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
	// Vérifier si une date est complètement bloquée
	const isDateBlocked = async (date) => {
		try {
			const q = query(collection(db, "blockedDates"), where("date", "==", date), where("allDay", "==", true));
			const querySnapshot = await getDocs(q);
			return !querySnapshot.empty;
		} catch (error) {
			console.error("Erreur vérification date bloquée:", error);
			return false;
		}
	};

	// Récupérer les heures bloquées pour une date
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
	const generateTimeSlots = async (serviceDuration, selectedDate) => {
		if (!selectedDate) return [];

		const slots = [];
		const startMorning = 9 * 60;
		const endMorning = 13.5 * 60;
		const startAfternoon = 14 * 60;
		const endAfternoon = 19 * 60;

		// Récupérer les heures bloquées pour cette date
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
			const available = await isSlotAvailable(selectedDate, slot, serviceDuration);
			if (available) {
				slots.push(slot);
			}
		}

		return slots;
	};

	const handleServiceChange = async (e) => {
		const serviceId = e.target.value;
		const selectedService = services.find((s) => s.id === serviceId);

		// TRACKING
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

	const handleChange = async (e) => {
		const { name, value } = e.target;

		if (name === "date") {
			// Si l'utilisateur efface la date ou clique juste sur le calendrier
			if (!value) {
				setFormData({ ...formData, [name]: value });
				return;
			}

			// Vérifier si c'est un weekend
			if (!isWeekend(value)) {
				alert("Veuillez sélectionner uniquement un samedi ou un dimanche");
				setFormData({ ...formData, date: "" }); // Réinitialiser la date
				return;
			}

			// Vérifier si la date est bloquée
			const blocked = await isDateBlocked(value);
			if (blocked) {
				alert("Cette date n'est pas disponible. Veuillez choisir une autre date.");
				setFormData({ ...formData, date: "" }); // Réinitialiser la date
				return;
			}

			logAnalyticsEvent("date_selected", {
				selected_date: value,
			});

			// Générer les créneaux horaires
			if (formData.service) {
				const selectedService = services.find((s) => s.id === formData.service);
				const slots = await generateTimeSlots(selectedService.duration, value);
				setAvailableSlots(slots);
			}
		}

		setFormData({ ...formData, [name]: value });
	};

	const isWeekend = (dateString) => {
		const date = new Date(dateString + "T00:00:00");
		const day = date.getDay();
		return day === 0 || day === 6;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isWeekend(formData.date)) {
			alert("Veuillez choisir un samedi ou un dimanche");
			return;
		}

		setIsSubmitting(true);

		const selectedService = services.find((s) => s.id === formData.service);

		// TRACKING - Tentative de réservation
		logAnalyticsEvent("booking_started", {
			service: selectedService.name,
			service_price: selectedService.price,
			date: formData.date,
		});

		// Vérifier une dernière fois la disponibilité
		const available = await isSlotAvailable(formData.date, formData.heure, selectedService.duration);
		if (!available) {
			// TRACKING - Créneau déjà pris
			logAnalyticsEvent("booking_slot_unavailable", {
				service: selectedService.name,
				requested_date: formData.date,
				requested_time: formData.heure,
			});

			alert("Désolé, ce créneau vient d'être réservé. Veuillez en choisir un autre.");
			setIsSubmitting(false);
			// Régénérer les créneaux disponibles
			const slots = await generateTimeSlots(selectedService.duration, formData.date);
			setAvailableSlots(slots);
			return;
		}

		try {
			// Sauvegarder la réservation dans Firebase
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
			});

			// EmailJS template parameters
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

			// Send emails
			await emailjs.send("service_4t9ude2", "template_z26jqp7", templateParams, "vSn8lOsAhAksc03kS");
			await emailjs.send("service_4t9ude2", "template_8smxy0b", templateParams, "vSn8lOsAhAksc03kS");

			// TRACKING - Réservation réussie (ÉVÉNEMENT DE CONVERSION PRINCIPAL)
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

			// TRACKING - Événement personnalisé de réservation complétée
			logAnalyticsEvent("booking_completed", {
				service_name: selectedService.name,
				service_id: selectedService.id,
				service_price: selectedService.price,
				booking_date: formData.date,
				booking_time: formData.heure,
				client_email: formData.email,
			});

			alert("Rendez-vous confirmé! Vous allez recevoir un email de confirmation.");

			// Reset form
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
			setAvailableSlots([]);
		} catch (error) {
			console.error("Erreur:", error);

			// TRACKING - Erreur lors de la réservation
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

	const getMinDate = () => {
		const today = new Date();
		return today.toISOString().split("T")[0];
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setMonth(maxDate.getMonth() + 3);
		return maxDate.toISOString().split("T")[0];
	};

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
							{services.map((service) => (
								<option key={service.id} value={service.id}>
									{service.name} - {service.price}
								</option>
							))}
						</select>
						<i className="fas fa-chevron-down select-arrow"></i>
					</div>
					{formData.service && <p className="service-description">{services.find((s) => s.id === formData.service)?.description}</p>}
				</div>
				<div className="form-group">
					<label htmlFor="date">
						<i className="far fa-calendar-alt"></i> Date souhaitée (Week-end uniquement)
					</label>
					<div className="date-input-container">
						<input type="date" id="date" name="date" value={formData.date} onChange={handleChange} min={getMinDate()} max={getMaxDate()} className="weekend-only-date" required />
						<i className="fas date-calendar-icon"></i>
					</div>
					{formData.date && !isWeekend(formData.date) && (
						<p className="error-message">
							<i className="fas fa-exclamation-circle"></i> Uniquement samedi ou dimanche
						</p>
					)}
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="heure">
							<i className="far fa-clock"></i> Heure préférée
						</label>
						<div className="select-wrapper">
							<select id="heure" name="heure" value={formData.heure} onChange={handleChange} disabled={!formData.service || !formData.date || availableSlots.length === 0} required>
								<option value="">{!formData.date ? "Choisir d'abord une date" : !formData.service ? "Choisir d'abord un service" : availableSlots.length === 0 ? "Aucun créneau disponible" : "Choisir un créneau"}</option>
								{availableSlots.map((slot) => (
									<option key={slot} value={slot}>
										{slot}
									</option>
								))}
							</select>
							<i className="fas fa-chevron-down select-arrow"></i>
						</div>
					</div>
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
						<li>Attention : présence de deux chats au domicile</li>
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
