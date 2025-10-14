import { useEffect, useRef } from "react";
import Silk from "../components/Silk.jsx";

function Hero() {
	const titleRef = useRef(null);
	const subtitleRef = useRef(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		// Trigger animations after component mounts
		setTimeout(() => {
			if (titleRef.current) titleRef.current.classList.add("blur-in");
		}, 100);

		setTimeout(() => {
			if (subtitleRef.current) subtitleRef.current.classList.add("blur-in");
		}, 400);

		setTimeout(() => {
			if (buttonRef.current) buttonRef.current.classList.add("blur-in");
		}, 700);
	}, []);

	const handleReservationClick = () => {
		const element = document.querySelector("#réservation");
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<div className="hero-container">
			{/* Silk Background */}
			<div className="hero-background">
				<Silk speed={5} scale={1} color="#c39e74" noiseIntensity={1} rotation={0} />
			</div>

			{/* Hero Content */}
			<div className="hero-content">
				<h1 ref={titleRef} className="hero-title hero-animate">
					Extensions de Cils Professionnelles
				</h1>
				<p ref={subtitleRef} className="hero-subtitle hero-animate">
					Révélez la beauté de votre regard avec nos extensions de cils sur mesure
				</p>
				<button ref={buttonRef} className="hero-cta hero-animate" onClick={handleReservationClick}>
					Prendre Rendez-vous
				</button>
			</div>
		</div>
	);
}

export default Hero;
