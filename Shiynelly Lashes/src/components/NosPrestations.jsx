import { useState, useEffect, useRef } from "react";
import { prestations } from "../../constants/index.js";
import SpotlightCard from "./SpotlightCard.jsx";

function NosPrestations() {
	const [openResults, setOpenResults] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const toggleResult = (index) => {
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
							<div className="prestation-content">
								<h3>{prestation.title}</h3>
								<p className="prestation-description">{prestation.description}</p>
								<span className="prestation-price">{prestation.price}</span>

								<button className={`result-toggle ${openResults[index] ? "active" : ""}`} onClick={() => toggleResult(index)}>
									Résultat
									<i className={`fas fa-arrow-down arrow-icon ${openResults[index] ? "rotated" : ""}`}></i>
								</button>

								<div className={`result-content-wrapper ${openResults[index] ? "show" : ""}`}>
									<div className="result-text">{prestation.result}</div>
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
