const { google } = require("googleapis");
const serviceAccount = require("./service-account.json");

const CALENDAR_ID = "studiobynelly@gmail.com";

async function testCalendar() {
	try {
		console.log("🔄 Test de connexion au calendrier...");

		const auth = new google.auth.GoogleAuth({
			credentials: serviceAccount,
			scopes: ["https://www.googleapis.com/auth/calendar"],
		});

		const authClient = await auth.getClient();
		console.log("✅ Auth client créé");

		const calendar = google.calendar({ version: "v3", auth: authClient });
		console.log("✅ Calendar client créé");

		// Tester la lecture du calendrier
		const response = await calendar.events.list({
			calendarId: CALENDAR_ID,
			maxResults: 1,
		});

		console.log("✅ SUCCÈS! Connexion OK");
		console.log("Événements trouvés:", response.data.items?.length || 0);
	} catch (error) {
		console.error("❌ ERREUR:", error.message);
		console.error("❌ Code:", error.code);
		if (error.response) {
			console.error("❌ Response:", error.response.data);
		}
	}
}

testCalendar();
