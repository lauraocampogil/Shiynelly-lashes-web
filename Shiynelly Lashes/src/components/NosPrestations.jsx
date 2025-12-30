import { useState, useEffect, useRef } from "react";
import { prestations } from "../../constants/index.js";
import SpotlightCard from "./SpotlightCard.jsx";
import { logAnalyticsEvent, db } from "../firebase/config.js";
import { doc, getDoc } from "firebase/firestore";

function NosPrestations() {
	const [openResults, setOpenResults] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const [isModelServiceOpen, setIsModelServiceOpen] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.3 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		checkModelServiceStatus();
	}, []);

	const checkModelServiceStatus = async () => {
		try {
			const docRef = doc(db, "settings", "modelService");
			const docSnap = await getDoc(docRef);

			setIsModelServiceOpen(docSnap.exists() ? docSnap.data().isOpen : false);
		} catch (error) {
			console.error("Erreur vérification service modèle:", error);
			setIsModelServiceOpen(false);
		}
	};

	const toggleResult = (index) => {
		const isOpening = !openResults[index];

		// TRACKING - Quand quelqu'un ouvre les détails d'un service
		if (isOpening) {
			logAnalyticsEvent("service_details_viewed", {
				service_name: prestations[index].title,
				service_price: prestations[index].price,
				service_index: index,
			});
		}

		setOpenResults((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	return (
		<section id="nosprestations" ref={sectionRef}>
			<div className={`prestations-container ${isVisible ? "fade-in-up" : ""}`}>
				<h2>Nos Prestations</h2>

				<div className="prestations-grid">
					{prestations.map((prestation, index) => (
						<SpotlightCard key={index} className="prestation-card" spotlightColor="rgba(195, 158, 116, 0.5)">
							{/* Badge dynamique pour le service Modèle */}
							{prestation.isModelService && <span className={`model-badge ${isModelServiceOpen ? "open" : "closed"}`}>{isModelServiceOpen ? "Disponible" : "Actuellement indisponible"}</span>}

							<div className="prestation-content">
								<h3>{prestation.title}</h3>
								<p className="prestation-description">{prestation.description}</p>
								<span className="prestation-price">{prestation.price}</span>

								<div className="prestation-result-container">
									<button className={`result-toggle ${openResults[index] ? "active" : ""}`} onClick={() => toggleResult(index)}>
										Résultat
										<i className={`fas fa-arrow-down arrow-icon ${openResults[index] ? "rotated" : ""}`}></i>
									</button>

									<div className={`result-content-wrapper ${openResults[index] ? "show" : ""}`}>
										<div className="result-text">{prestation.result}</div>
									</div>
								</div>
							</div>
						</SpotlightCard>
					))}
				</div>
			</div>
		</section>
	);
}

export default NosPrestations;
