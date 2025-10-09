import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { services } from "../../constants/index.js";

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

	const generateTimeSlots = (serviceDuration) => {
		const slots = [];
		const startMorning = 9 * 60;
		const endMorning = 12 * 60;
		const startAfternoon = 13 * 60;
		const endAfternoon = 19 * 60;

		for (let time = startMorning; time + serviceDuration <= endMorning; time += 30) {
			const hours = Math.floor(time / 60);
			const minutes = time % 60;
			slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
		}

		for (let time = startAfternoon; time + serviceDuration <= endAfternoon; time += 30) {
			const hours = Math.floor(time / 60);
			const minutes = time % 60;
			slots.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
		}

		return slots;
	};

	const handleServiceChange = (e) => {
		const serviceId = e.target.value;
		const selectedService = services.find((s) => s.id === serviceId);

		setFormData({ ...formData, service: serviceId, heure: "" });

		if (selectedService) {
			const slots = generateTimeSlots(selectedService.duration);
			setAvailableSlots(slots);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Validate date is weekend when date changes
		if (name === "date" && value) {
			if (!isWeekend(value)) {
				alert("Veuillez sélectionner uniquement un samedi ou un dimanche");
				return;
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

		// EmailJS template parameters
		const templateParams = {
			to_name: formData.prenom,
			from_name: `${formData.prenom} ${formData.nom}`,
			client_email: formData.email,
			client_phone: formData.telephone,
			service_name: `${selectedService.name} - ${selectedService.price}`,
			appointment_date: new Date(formData.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
			appointment_time: formData.heure,
			comments: formData.commentaires || "Aucun",
			address: "60 bd Pasteur 94260 - Sonner à Demoniere, prendre le 2ème ascenseur près des escaliers, sortir à gauche, sonner porte L",
			instructions: "Venez avec les cils propres et démaquillés. Attention : présence de deux chats au domicile.",
		};

		try {
			// Replace with your EmailJS credentials
			await emailjs.send(
				"YOUR_SERVICE_ID", // Replace with your EmailJS service ID
				"YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
				templateParams,
				"YOUR_PUBLIC_KEY" // Replace with your EmailJS public key
			);

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
			console.error("EmailJS Error:", error);
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

				<div className="form-row">
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

					<div className="form-group">
						<label htmlFor="heure">
							<i className="far fa-clock"></i> Heure préférée
						</label>
						<div className="select-wrapper">
							<select id="heure" name="heure" value={formData.heure} onChange={handleChange} disabled={!formData.service} required>
								<option value="">Choisir un créneau</option>
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
						<i className="fas fa-info-circle"></i> Informations importantes :
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
