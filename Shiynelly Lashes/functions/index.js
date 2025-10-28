const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();

const CALENDAR_ID = "studiobynelly@gmail.com";
const SERVICE_ACCOUNT_EMAIL = "shiynelly-calendar-service@shiynelly-lashes.iam.gserviceaccount.com";

// Clé privée avec les vrais retours à la ligne
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDKM/rQ4A09Kv2F
qo0ZQYXdpMAv/VUZXvi5XCUBb9ok4qG4Qd3i+l3iFma9BU1Y3/7YaqKsblIi8wqy
B4YsDXh1alPOcFpc3ToUGoYJxPtHZIr4p0WjJynR1Qr5xf5iyZ/E1dCoIxnvNTUz
av3nS4X+iZ3W/BW8BvOI3f414SmErAvxqh/xB9JpY854D1HEhejmLa1Oz66yA4x3
VE7cF9yuotAZ6cV+27fZ6QmfO09oI3TorBOD8hSv5qRtOFuRHpjEZHpctfVgiMR0
nG4jGOfRYeziqGcFLPdqfwII1G8ed8fOcGZtsx8mAHlhN+zTx6khSN+1k2AEp4ZK
Jk8ppkmnAgMBAAECggEAHCTSVyAAUmW5Ria1dJuinXWGId0sauzFniMoVsQHRGqz
oLkGQHFMVPYnlE1NypOEM1eFpI4cakHoLgcPEp2eCRW6Fs9GPIu26ZUW1/ruEK36
tokDD9DufgbIUXil+NZgdwiy/gbDYCtIkuC5o2e8fZpmTkXluTdBzr3mBADULbjM
UJ8r9h4YqvN++E98uyu2+aYAowB0rEComUf5boTnqtob3zhTltoHpkQ/WUAuv9+6
8Y/KY2ZzxLRaF3eHCJhxUwWcHYKVQnCVnFrh5WNHhE2W/oQdRHzEbtT28k3K9g/J
Tt0uQ7GjmLM0UUcXWZpbY2vrxYK0O+CAFMvZ2tU7KQKBgQD87oRUd+TCNSx51JbZ
V4JV6dyHFxSEl+23YKPHbzP4iM2fnd+itJdV01zn/fYgITrTZ3P7VT92L1jx0D6i
NitU0j/oxK+T58Ie43yNBjqVboNfT1Xxk6dEeJalU0SFAhJDfsCayqYaGVQqmx1H
hCI1uO+xAxa73FVcA9GxmJbJmQKBgQDMp+ybN6uOdwh/cA68cfWi0pEjRVNmehWy
O/KnBYJ87bbz8w91oH6QudrGOUy0uhhxpYOW5weyXN7pr4EL6bqvVMSlHTHmuenX
ykJqQa30jNUKSC0f/lIwVG+OIyqJt8+dIVCnMHTrpqQE0dLWzCdJdRS7diOz2kfs
OZ6Dt/41PwKBgFd5/pZgKOPqFAnGtq1QkKk6CqVGHDiHexWy/LHbCfRpDASqS1Aw
eS6bvUQXF2qhU4EOBJTmNN6hHXf0d9UOOwpI9QWCEN9shjy8nLUBdH1+DT2HaMf2
MyGBO0jOdaIyxzJEwkRG1g+stulNYGD9l/9QiMWFtfUfDP6X64wqo+vxAoGACNJg
P5yZt41n/15MNFFRPlCHUxbk7nDqyIEPB6YUJuB0V3Wtv+tIKWLpjEviA5RWA2gY
EQQqb8TTEw2uqV3M30vvIhLtGL4A131veXcVUYpUkJnl4BAtaMnq+RyI8+DJgUNz
X5GWKKZJQa/tv7aTJvZ2C1KfXVxWZ1dgftsKiS8CgYBVq2XW/I8GeQhgU23P0s/n
XgEXF5yFfOMep1BUoV58rwy1LPBNEmckh2uVOt5ZW6T7TonDvHkSG9dOVclXC4Uu
UDQGrBOEaUMjH7VHe+I50IGDHSsuNbEZdsWR7nWBle94CR2mxgPuXXM+P0W2ngmt
+FNkVO9xcIz1wDoXHHdy4A==
-----END PRIVATE KEY-----`;

// Créer le client JWT avec la clé
const jwtClient = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, null, PRIVATE_KEY, ["https://www.googleapis.com/auth/calendar"]);

const calendar = google.calendar({ version: "v3", auth: jwtClient });

// Fonction: Créer un événement dans le calendrier
exports.createCalendarEvent = functions.firestore.document("reservations/{reservationId}").onCreate(async (snap, context) => {
	const reservation = snap.data();

	try {
		// Convertir la date et l'heure
		const [hours, minutes] = reservation.heure.split(":");
		const startDate = new Date(reservation.date + "T00:00:00");
		startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

		const endDate = new Date(startDate);
		endDate.setMinutes(endDate.getMinutes() + reservation.duration);

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

		console.log("🔄 Tentative de création d'événement...");

		const response = await calendar.events.insert({
			calendarId: CALENDAR_ID,
			resource: event,
			sendUpdates: "all",
		});

		console.log("✅ Événement créé:", response.data.htmlLink);

		await snap.ref.update({
			calendarEventId: response.data.id,
			calendarEventLink: response.data.htmlLink,
		});

		return response.data;
	} catch (error) {
		console.error("❌ Erreur création événement:", error.message);
		console.error("❌ Détails:", JSON.stringify(error, null, 2));
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
		console.error("❌ Erreur suppression événement:", error.message);
		return null;
	}
});
