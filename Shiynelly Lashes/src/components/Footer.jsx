import { useEffect, useRef, useState } from "react";

function Footer() {
	const footerRef = useRef(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (!footerRef.current) return;

			const footerTop = footerRef.current.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;

			// When footer comes into view, trigger slide up
			if (footerTop <= windowHeight * 0.8) {
				setIsVisible(true);
				const prevSection = document.querySelector(".section-before-footer");
				if (prevSection) {
					prevSection.classList.add("slide-up");
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Check initial position

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<footer ref={footerRef} className={`footer ${isVisible ? "footer-visible" : ""}`}>
			<div className="footer-content">
				<div className="footer-main">
					<div className="footer-section">
						<h3 className="footer-logo">Shiynelly Lashes</h3>
						<p className="footer-tagline">Extensions de cils professionnelles</p>
						<div className="footer-social">
							<a href="https://www.instagram.com/shiynellylashes/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
								<i className="fab fa-instagram"></i>
							</a>
							<a href="https://www.tiktok.com/@shiynellylashes" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
								<i className="fab fa-tiktok"></i>
							</a>
						</div>
					</div>

					<div className="footer-section">
						<h4>Navigation</h4>
						<ul>
							<li>
								<a href="#home">Accueil</a>
							</li>
							<li>
								<a href="#nos-prestations">Nos Prestations</a>
							</li>
							<li>
								<a href="#contact">Contact</a>
							</li>
							<li>
								<a href="#reservation">Réservation</a>
							</li>
						</ul>
					</div>

					<div className="footer-section">
						<h4>Services</h4>
						<ul>
							<li>
								<a href="#nos-prestations">Cils à Cils</a>
							</li>
							<li>
								<a href="#nos-prestations">Pose Whispy</a>
							</li>
							<li>
								<a href="#nos-prestations">Pose Russe</a>
							</li>
							<li>
								<a href="#nos-prestations">Clusters</a>
							</li>
							<li>
								<a href="#nos-prestations">Dépose</a>
							</li>
						</ul>
					</div>

					<div className="footer-section">
						<h4>Contact</h4>
						<ul className="footer-contact">
							<li>
								<i className="fas fa-map-marker-alt"></i>
								<span>94260 Fresnes, France</span>
							</li>
							<li>
								<i className="fas fa-envelope"></i>
								<a href="mailto:studiobynelly@gmail.com" className="email-link">
									<span>studiobynelly@gmail.com</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="footer-bottom">
					<p>&copy; 2025 Unix Creative Studio. Tous droits réservés.</p>
					<div className="footer-legal">
						<a href="https://mixed-stoat-359.notion.site/Terms-and-Conditions-28788674cf3280a286eaf731367bed4b?source=copy_link">Mentions légales</a>
						<span>•</span>
						<a href="https://mixed-stoat-359.notion.site/Privacy-Policy-28788674cf3280b3a03dd515020f46f2?source=copy_link">Politique de confidentialité</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
