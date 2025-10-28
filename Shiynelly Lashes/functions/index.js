const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const path = require("path");

admin.initializeApp();

const CALENDAR_ID = "studiobynelly@gmail.com";

// Charger les credentials depuis le fichier JSON
const serviceAccountPath = path.join(__dirname, "service-account.json");
const serviceAccount = require(serviceAccountPath);

// Créer le client JWT
const jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, ["https://www.googleapis.com/auth/calendar"]);

const calendar = google.calendar({ version: "v3", auth: jwtClient });

// Fonction: Créer un événement dans le calendrier
exports.createCalendarEvent = functions.firestore.document("reservations/{reservationId}").onCreate(async (snap, context) => {
	const reservation = snap.data();

	try {
		console.log("🔄 Démarrage création événement...");
		console.log("📧 Service Account Email:", serviceAccount.client_email);
		console.log("📅 Calendar ID:", CALENDAR_ID);

		// Convertir la date et l'heure
		const [hours, minutes] = reservation.heure.split(":");
		const startDate = new Date(reservation.date + "T00:00:00");
		startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

		const endDate = new Date(startDate);
		endDate.setMinutes(endDate.getMinutes() + reservation.duration);

		console.log("🕐 Start:", startDate.toISOString());
		console.log("🕐 End:", endDate.toISOString());

		const event = {
			summary: `${reservation.service} - ${reservation.prenom} ${reservation.nom}`,
			description: `
📱 Téléphone: ${reservation.telephone}
📧 Email: ${reservation.email}
💬 Commentaires: ${reservation.commentaires || "Aucun"}

⚠️ Informations importantes:
- Venez avec les cils propres et démaquillés
- Attention : présence de deux chats au domicile

📍 Adresse: 60 bd Pasteur 94260 Fresnes
Sonner à Demoniere, prendre le 2ème ascenseur près des escaliers, sortir à gauche, sonner porte L
        `,
			start: {
				dateTime: startDate.toISOString(),
				timeZone: "Europe/Paris",
			},
			end: {
				dateTime: endDate.toISOString(),
				timeZone: "Europe/Paris",
			},
			attendees: [
				{
					email: reservation.email,
					displayName: `${reservation.prenom} ${reservation.nom}`,
				},
			],
			reminders: {
				useDefault: false,
				overrides: [
					{ method: "email", minutes: 24 * 60 },
					{ method: "popup", minutes: 60 },
				],
			},
			colorId: "9",
		};

		console.log("📤 Envoi de la requête à Google Calendar...");

		const response = await calendar.events.insert({
			calendarId: CALENDAR_ID,
			resource: event,
			sendUpdates: "all",
		});

		console.log("✅ SUCCÈS! Événement créé:", response.data.htmlLink);

		await snap.ref.update({
			calendarEventId: response.data.id,
			calendarEventLink: response.data.htmlLink,
		});

		return response.data;
	} catch (error) {
		console.error("❌ ERREUR COMPLÈTE:", error);
		console.error("❌ Message:", error.message);
		console.error("❌ Code:", error.code);
		if (error.response) {
			console.error("❌ Response data:", error.response.data);
			console.error("❌ Response status:", error.response.status);
		}
		return null;
	}
});

// Fonction: Supprimer un événement du calendrier
exports.deleteCalendarEvent = functions.firestore.document("reservations/{reservationId}").onDelete(async (snap, context) => {
	const reservation = snap.data();

	if (!reservation.calendarEventId) {
		console.log("Pas d'ID événement calendar à supprimer");
		return null;
	}

	try {
		await calendar.events.delete({
			calendarId: CALENDAR_ID,
			eventId: reservation.calendarEventId,
		});

		console.log("✅ Événement supprimé du calendrier");
		return null;
	} catch (error) {
		console.error("❌ Erreur suppression:", error.message);
		return null;
	}
});
