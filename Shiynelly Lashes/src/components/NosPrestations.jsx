import { useState } from "react";
import { prestations } from "../../constants/index.js";
import SpotlightCard from "./SpotlightCard.jsx";

function NosPrestations() {
	const [openResults, setOpenResults] = useState({});

	const toggleResult = (index) => {
		setOpenResults((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};
	return (
		<section id="nosprestations">
			<div className="prestations-container">
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
