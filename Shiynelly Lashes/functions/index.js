const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();

const CALENDAR_ID = "studiobynelly@gmail.com";
const SERVICE_ACCOUNT_EMAIL = "shiynelly-calender-service@shiynelly-lashes-476112.iam.gserviceaccount.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCgYfTWH6K/bX5H
vhXgXfZ+blgPKPsYE2BWkCWQFXivKt7tPLaKeDjDDvmsmvBMEWd8qvUZA8pAaxiF
WZ1/DYLf2IX7dnL6brP6o1G4Sd/HPr54rO223lrSAWgvGUfFY8yjkxv+oATQVP3N
6Ke7G4kLM5O3rPhRH6WtFX04XPCl7zyeF0HdykUlNpCz640DRVbiru/ykj2WxHvR
fB67IiNLhJSiBd1LD3Qbeu4arNDVbbdkRFUxJDN0XHUe+8WKrT2DpGYECjREJXW7
pECGnEtrkt8It8KTEU4BPs4J37QTHCtlo7zW1jKTHWLQAnSJTvMlvhrImFOjI5oj
01Sn6q5TAgMBAAECggEAAXbzi/MNAu+GjDQtsfdZtWzfi//lTyJ6KkA1v5ualwru
rz7zMc+IQSvFVvCxShiMl+RdyaUxtyXjOvCHEi526AFrs9Cwmx3gseTE7chq7UBi
7+owX4+nR6ywnWF/OMvBBitlQY2HjbmA+dzqjzhgp4QIkNBZEjCWTD7afmXG4tUJ
RkchyCkoTWhtLhvDomo0CfzEvVBXoH0hFSsBEVuU62+FZ1p7w1Tw5RcOkaMsuZ3j
zF0ICIbmNFfDsd9UEePdT1Oq8N6zQcF9bHxpbZY/+YKyLWHxRuqIuAObYVVtF+sb
MhwRtIndv9P7XvOveL2HeIpFynOE0niW1cnbf4ETnQKBgQDRC5yP6AU/LstBOq6Z
+VPG7DXSAajwvIKdyHtcrpFD+yVFGd0aPL+f77KrrUlXn69b/zf5BkAW8A6bEKI6
aAupbNmANPMGUP84QbrzbzbvcZvxRTmo6AVUBcYb4ICuTf066+Wy4w9HO3rSaNNQ
SJ7gfhA6LvbLkm9WuTVD2tEiJQKBgQDEaCxk16PjtzrwSZHARomkaZ3OIhDkISbj
rraoqGlm5hrxDk1/VrnPc+Bby2LkBO66Pmk5EXg5ElNlcIFY/yg60wGIi+ApQ3VL
Y0/H2idPrK9qoQIz0g0ztMF0zo9jS/x1Mfu2SKbuCh2qvLUOQYr7vdE85TUyhbpV
pcbKti8ZFwKBgGvtfsudkvfoBPCMh5DfdS2Czta6HKsN6LHlzCsxxbY/eCKRE+Jz
8st0Sd7w/KjMvRDWV+OuInC1SBUvJVLaXQsAM9tJex+LufkllowQo2BEW6rZfseB
4x5aTMofwtA7W76MBG+zYzP3tZXkoRUWKVDmRSKFFM5NsEYqISIDW24xAoGAX03R
ZOmCfEf4EIsSb4OK3L3nNhQvsBMqJMctmS+HXcgAgMIY9tZleXXYA5LwnIaMNNF+
C5Qfi0oKL6nlCgNeSRUEpHaDQmKacwdwuiBwfOflgs84G18sys9GJGDrERrZGSE0
7CHa5p0AAk5paM6DG17jPjJWmvprDY5QpSK8PecCgYAVYBPwGRf/jLV6P3urVxoM
24zPvibZrrWGDVZ9L2q/Yo/qN9fFuc6LuWegi4nEz/MXWOHfjEuu9HAKquAgGFD7
kUDh/cZ+F39M/uO1Ov+SnCC1lqbmMhwR1EM0xc6RjMVLJi9YW2+LnIXW1icRS0N7
3zQIDQcz8ZOoRVxBEgB8Pg==
-----END PRIVATE KEY-----`;

// Créer le client Google Calendar
const auth = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, null, PRIVATE_KEY, ["https://www.googleapis.com/auth/calendar"]);

const calendar = google.calendar({ version: "v3", auth });

// Fonction déclenchée quand une réservation est créée
exports.createCalendarEvent = functions.firestore.document("reservations/{reservationId}").onCreate(async (snap, _context) => {
	const reservation = snap.data();

	try {
		// Convertir la date et l'heure en format ISO
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

📍 Adresse: 60 bd Pasteur 94260
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
			attendees: [{ email: reservation.email, displayName: `${reservation.prenom} ${reservation.nom}` }],
			reminders: {
				useDefault: false,
				overrides: [
					{ method: "email", minutes: 24 * 60 },
					{ method: "popup", minutes: 60 },
				],
			},
			colorId: "9",
		};

		const response = await calendar.events.insert({
			calendarId: CALENDAR_ID,
			resource: event,
			sendUpdates: "all",
		});

		console.log("Événement créé:", response.data.htmlLink);

		await snap.ref.update({
			calendarEventId: response.data.id,
			calendarEventLink: response.data.htmlLink,
		});

		return response.data;
	} catch (error) {
		console.error("Erreur création événement:", error);
		return null;
	}
});

exports.deleteCalendarEvent = functions.firestore.document("reservations/{reservationId}").onDelete(async (snap, _context) => {
	const reservation = snap.data();

	if (!reservation.calendarEventId) {
		return null;
	}

	try {
		await calendar.events.delete({
			calendarId: CALENDAR_ID,
			eventId: reservation.calendarEventId,
			sendUpdates: "all",
		});

		console.log("Événement supprimé");
		return null;
	} catch (error) {
		console.error("Erreur suppression:", error);
		return null;
	}
});
const emailjs = require("@emailjs/nodejs");

// Fonction pour envoyer un email d'annulation
exports.sendCancellationEmail = functions.firestore.document("reservations/{reservationId}").onDelete(async (snap, _context) => {
	const reservation = snap.data();

	try {
		// Template parameters pour l'email d'annulation
		const templateParams = {
			to_name: reservation.prenom,
			from_name: "Shiynelly Lashes",
			client_email: reservation.email,
			service_name: reservation.service,
			appointment_date: new Date(reservation.date).toLocaleDateString("fr-FR", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			appointment_time: reservation.heure,
			booking_link: "https://shiynellylashes.com/#réservation",
		};

		// Envoyer l'email d'annulation
		await emailjs.send(
			"service_4t9ude2", //Service ID
			"template_it6eot2",
			templateParams,
			{
				publicKey: "vSn8lOsAhAksc03kS",
				privateKey: "ZQPlChuSjeYg-LHc7yxvX",
			}
		);

		console.log("Email d'annulation envoyé à:", reservation.email);
		return null;
	} catch (error) {
		console.error("Erreur envoi email d'annulation:", error);
		return null;
	}
});
