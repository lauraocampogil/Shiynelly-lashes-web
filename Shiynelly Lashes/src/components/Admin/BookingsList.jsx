import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import emailjs from "@emailjs/browser";

function BookingsList() {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadBookings();
	}, []);

	const loadBookings = async () => {
		try {
			const q = query(collection(db, "reservations"), orderBy("timestamp", "desc"));
			const querySnapshot = await getDocs(q);
			const bookingsData = [];
			const now = new Date();

			querySnapshot.forEach((doc) => {
				const booking = { id: doc.id, ...doc.data() };

				// Vérifier si la réservation est passée
				const bookingDate = new Date(booking.date + "T" + booking.heure);
				booking.isPast = bookingDate < now;

				bookingsData.push(booking);
			});

			setBookings(bookingsData);
		} catch (error) {
			console.error("Erreur chargement réservations:", error);
		} finally {
			setLoading(false);
		}
	};

	const deleteBooking = async (id) => {
		const booking = bookings.find((b) => b.id === id);

		if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation?")) return;

		try {
			await deleteDoc(doc(db, "reservations", id));

			// Envoyer l'email d'annulation au client
			try {
				const templateParams = {
					to_name: booking.prenom,
					from_name: "Shiynelly Lashes",
					client_email: booking.email,
					service_name: booking.service,
					appointment_date: new Date(booking.date).toLocaleDateString("fr-FR", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					appointment_time: booking.heure,
					booking_link: "https://shiynellylashes.com/#/",
				};

				await emailjs.send("service_4t9ude2", "template_it6eot2", templateParams, "vSn8lOsAhAksc03kS");

				console.log("Email d'annulation envoyé");
			} catch (emailError) {
				console.error("Erreur email:", emailError);
			}

			setBookings(bookings.filter((b) => b.id !== id));
			alert("Réservation annulée et email envoyé au client");
		} catch (error) {
			console.error("Erreur suppression:", error);
			alert("Erreur lors de l'annulation");
		}
	};

	if (loading) return <div className="loading">Chargement...</div>;

	// Séparer les réservations futures et passées
	const upcomingBookings = bookings.filter((b) => !b.isPast);
	const pastBookings = bookings.filter((b) => b.isPast);

	return (
		<div className="bookings-list">
			{/* Réservations à venir */}
			<h2>
				<i className="fa-solid fa-calendar-check"></i> Réservations à venir ({upcomingBookings.length})
			</h2>

			{upcomingBookings.length === 0 ? (
				<p className="no-bookings">Aucune réservation à venir</p>
			) : (
				<div className="bookings-table">
					{upcomingBookings.map((booking) => (
						<div key={booking.id} className="booking-card">
							<div className="booking-header">
								<h3>
									{booking.prenom} {booking.nom}
								</h3>
								<span className="booking-service">{booking.service}</span>
							</div>

							<div className="booking-details">
								<p>
									<i className="fa-solid fa-calendar"></i> <strong>Date:</strong> {new Date(booking.date).toLocaleDateString("fr-FR")}
								</p>
								<p>
									<i className="fa-solid fa-clock"></i> <strong>Heure:</strong> {booking.heure}
								</p>
								<p>
									<i className="fa-solid fa-envelope"></i> <strong>Email:</strong> {booking.email}
								</p>
								<p>
									<i className="fa-solid fa-phone"></i> <strong>Téléphone:</strong> {booking.telephone}
								</p>
								{booking.commentaires && (
									<p>
										<i className="fa-solid fa-comment"></i> <strong>Commentaires:</strong> {booking.commentaires}
									</p>
								)}
							</div>

							<button onClick={() => deleteBooking(booking.id)} className="delete-button">
								<i className="fa-solid fa-trash-can"></i> Annuler
							</button>
						</div>
					))}
				</div>
			)}

			{/* Réservations passées */}
			{pastBookings.length > 0 && (
				<>
					<h2 style={{ marginTop: "40px" }}>
						<i className="fa-solid fa-circle-check"></i> Réservations terminées ({pastBookings.length})
					</h2>

					<div className="bookings-table">
						{pastBookings.map((booking) => (
							<div key={booking.id} className="booking-card booking-past">
								<div className="booking-header">
									<h3>
										{booking.prenom} {booking.nom}
									</h3>
									<div className="booking-header-badges">
										<span className="booking-service booking-service-past">{booking.service}</span>
										<span className="badge-completed">
											<i className="fa-solid fa-circle-check"></i> Terminée
										</span>
									</div>
								</div>

								<div className="booking-details">
									<p>
										<i className="fa-solid fa-calendar"></i> <strong>Date:</strong> {new Date(booking.date).toLocaleDateString("fr-FR")}
									</p>
									<p>
										<i className="fa-solid fa-clock"></i> <strong>Heure:</strong> {booking.heure}
									</p>
									<p>
										<i className="fa-solid fa-envelope"></i> <strong>Email:</strong> {booking.email}
									</p>
									<p>
										<i className="fa-solid fa-phone"></i> <strong>Téléphone:</strong> {booking.telephone}
									</p>
									{booking.commentaires && (
										<p>
											<i className="fa-solid fa-comment"></i> <strong>Commentaires:</strong> {booking.commentaires}
										</p>
									)}
								</div>

								<button onClick={() => deleteBooking(booking.id)} className="delete-button delete-button-past">
									<i className="fa-solid fa-trash-can"></i> Supprimer
								</button>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}

export default BookingsList;
