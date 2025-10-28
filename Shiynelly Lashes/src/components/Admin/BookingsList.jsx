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

			querySnapshot.forEach((doc) => {
				bookingsData.push({ id: doc.id, ...doc.data() });
			});

			setBookings(bookingsData);
		} catch (error) {
			console.error("Erreur chargement réservations:", error);
		} finally {
			setLoading(false);
		}
	};

	const deleteBooking = async (id) => {
		// Trouver la réservation avant de la supprimer
		const booking = bookings.find((b) => b.id === id);

		if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation?")) return;

		try {
			// Supprimer de Firestore (cela déclenche aussi la suppression du calendrier)
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

				await emailjs.send(
					"service_4t9ude2",
					"template_it6eot2", // template_id annulation
					templateParams,
					"vSn8lOsAhAksc03kS"
				);

				console.log("Email d'annulation envoyé");
			} catch (emailError) {
				console.error("Erreur email:", emailError);
				// Continue même si l'email échoue
			}

			setBookings(bookings.filter((b) => b.id !== id));
			alert("Réservation annulée et email envoyé au client");
		} catch (error) {
			console.error("Erreur suppression:", error);
			alert("Erreur lors de l'annulation");
		}
	};

	if (loading) return <div className="loading">Chargement...</div>;

	return (
		<div className="bookings-list">
			<h2>📅 Réservations ({bookings.length})</h2>

			{bookings.length === 0 ? (
				<p className="no-bookings">Aucune réservation pour le moment</p>
			) : (
				<div className="bookings-table">
					{bookings.map((booking) => (
						<div key={booking.id} className="booking-card">
							<div className="booking-header">
								<h3>
									{booking.prenom} {booking.nom}
								</h3>
								<span className="booking-service">{booking.service}</span>
							</div>

							<div className="booking-details">
								<p>
									📅 <strong>Date:</strong> {new Date(booking.date).toLocaleDateString("fr-FR")}
								</p>
								<p>
									🕐 <strong>Heure:</strong> {booking.heure}
								</p>
								<p>
									📧 <strong>Email:</strong> {booking.email}
								</p>
								<p>
									📱 <strong>Téléphone:</strong> {booking.telephone}
								</p>
								{booking.commentaires && (
									<p>
										💬 <strong>Commentaires:</strong> {booking.commentaires}
									</p>
								)}
							</div>

							<button onClick={() => deleteBooking(booking.id)} className="delete-button">
								🗑️ Annuler
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default BookingsList;
