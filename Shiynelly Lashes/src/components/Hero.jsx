import Silk from "../components/Silk.jsx";

function Hero() {
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
				<h1 className="hero-title">Extensions de Cils Professionnelles</h1>
				<p className="hero-subtitle">Révélez la beauté de votre regard avec nos extensions de cils sur mesure</p>
				<button className="hero-cta" onClick={handleReservationClick}>
					Prendre Rendez-vous
				</button>
			</div>
		</div>
	);
}

export default Hero;
