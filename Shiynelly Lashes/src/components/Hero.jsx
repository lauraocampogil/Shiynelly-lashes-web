import Silk from "../components/Silk.jsx";

function Hero() {
	return (
		<div className="hero-container">
			{/* Silk Background */}
			<div className="hero-background">
				<Silk speed={5} scale={1} color="#c39e74" noiseIntensity={1.5} rotation={0} />
			</div>

			{/* Hero Content */}
			<div className="hero-content">
				<h1 className="hero-title">Shiynelly Lashes</h1>
				<p className="hero-subtitle">Elevate Your Natural Beauty</p>
				<button className="hero-cta">Book Now</button>
			</div>
		</div>
	);
}

export default Hero;
