export const navLinks = [
	{ name: "Home", path: "/" },
	{ name: "Nos Prestations", path: "#nosprestations" },
	{ name: "Contact", path: "#contact" },
	{ name: "Réservation", path: "#réservation" },
];

export const prestations = [
	{
		title: "Cils à Cils",
		description: "Une extension par cil naturel pour un look subtil et élégant",
		price: "25€",
		result: "Des cils allongés, un regard sublimé, tout en finesse",
	},
	{
		title: "Pose Whispy",
		description: "Des cils de longueurs variées qui apportent volume, intensité et dimension au regard",
		price: "25€",
		result: "Un regard harmonieux alliant naturel et intensité",
	},
	{
		title: "Pose Mixte",
		description: "Combinaison de la technique cil à cil et de la pose russe pour un effet sur-mesure",
		price: "25€",
		result: "Un regard personnalisé alliant volume et naturel, idéal pour un effet équilibré",
	},
	{
		title: "Pose Russe",
		description: "Consiste à appliquer des éventails d'extensions préformés (bouquets) sur chaque cil naturel",
		price: "25€",
		result: "Un regard fourni, harmonieux et glamour, avec une tenue longue durée",
	},
	{
		title: "Dépose",
		description: "La dépose de cils permet de retirer en douceur les extensions sans abîmer les cils naturels, grâce à un dissolvant professionnel adapté",
		price: "15€",
		result: "Des cils naturels préservés et prêts pour une nouvelle pose",
	},
	{
		title: "Clusters",
		description: "La pose de clusters consiste à appliquer des petits bouquets de cils prêts à poser sur la base des cils naturels",
		price: "10€",
		result: "Regard intense et fourni, parfait pour une beauté express",
	},
	{
		title: "Pose de Cils",
		description: "Coiffage de cils au perming suivi d'une pose complète pour un regard structuré et volumineux",
		price: "35€",
		result: "Des cils naturellement relevés et sublimés par des extensions, pour un regard maximal",
	},
	{
		title: "Modèle - Entraînement",
		description: "Prestation gratuite pour modèle (uniquement sur rendez-vous confirmé par l'esthéticienne)",
		price: "Gratuit",
		result: "Une prestation complète offerte en échange de votre temps pour l'entraînement",
		isModelService: true, // Nouveau flag
	},
];

export const services = [
	{
		id: "cil-a-cil",
		name: "Cils à Cils",
		price: "25€",
		duration: 240, // 4h in minutes
		description: "La pose cil à cil consiste à appliquer une extension sur chaque cil naturel pour un regard naturel, élégant et structuré.",
	},
	{
		id: "pose-whispy",
		name: "Pose Whispy",
		price: "25€",
		duration: 240, // 4h in minutes
		description: 'La pose Whispy, aussi appelée effet "foxy eyes" ou "spiky", se caractérise par des pics de longueurs variées.',
	},
	{
		id: "pose-mixte",
		name: "Pose Mixte",
		price: "25€",
		duration: 240, // 4h in minutes
		description: "La pose mixte combine la technique cil à cil et la pose russe pour un résultat personnalisé alliant volume et naturel.",
	},
	{
		id: "pose-russe",
		name: "Pose Russe",
		price: "25€",
		duration: 240, // 4h in minutes
		description: "La pose russe en bouquet consiste à appliquer des éventails d'extensions préformés sur chaque cil naturel.",
	},
	{
		id: "clusters",
		name: "Clusters (venir avec la boîte)",
		price: "10€",
		duration: 90, // 1h30 in minutes
		description: "La pose de clusters consiste à appliquer des petits bouquets de cils prêts à poser.",
	},
	{
		id: "depose",
		name: "Dépose",
		price: "15€",
		duration: 120, // 2h in minutes
		description: "La dépose de cils permet de retirer en douceur les extensions sans abîmer les cils naturels.",
	},
	{
		id: "coiffage-pose",
		name: "Pose de Cils",
		price: "35€",
		duration: 330, // 5h30 in minutes
		description: "Coiffage de cils au perming suivi d'une pose complète pour un regard structuré et volumineux.",
	},
	// SERVICE MODÈLE - Non visible dans le formulaire client normal
	{
		id: "modele-entrainement",
		name: "Modèle - Entraînement",
		price: "0€",
		duration: 240, // 4h in minutes
		description: "Prestation gratuite pour modèle (uniquement sur rendez-vous confirmé par l'esthéticienne)",
		isModelService: true, // Flag spécial
		adminOnly: true, // Seulement admin peut créer ces RDV
	},
];
