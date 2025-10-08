import { useState } from "react";
import Logo from "../assets/images/Logo/Logo-SL-white-nobg.png";
import { navLinks } from "../../constants/index.js";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	return (
		<>
			<nav className="navbar">
				<div className="navbar-container">
					<a href="./" className="navbar-logo">
						<img src={Logo} alt="Shiynelly Lashes Logo" />
						<p className="logo-text">Shiynelly Lashes</p>
					</a>

					{/* Desktop Navigation */}
					<div className="navbar-links">
						{navLinks.slice(0, 3).map((link, index) => (
							<a key={index} href={link.path} className="nav-link">
								{link.name}
							</a>
						))}

						<a href={navLinks[3].path} className="nav-button">
							{navLinks[3].name}
						</a>
					</div>

					{/* Hamburger Menu Button */}
					<button className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu} aria-label="Toggle menu">
						<span className="hamburger-line"></span>
						<span className="hamburger-line"></span>
					</button>
				</div>
			</nav>

			{/* Mobile Sidebar Menu */}
			<div className={`sidebar-overlay ${isMenuOpen ? "active" : ""}`} onClick={closeMenu}></div>
			<div className={`sidebar-menu ${isMenuOpen ? "active" : ""}`}>
				<div className="sidebar-header">
					<h2>Menu</h2>
					<button className="close-button" onClick={closeMenu}>
						×
					</button>
				</div>

				<div className="sidebar-links">
					{navLinks.slice(0, 3).map((link, index) => (
						<a key={index} href={link.path} className="sidebar-link" onClick={closeMenu}>
							{link.name}
						</a>
					))}

					<a href={navLinks[3].path} className="sidebar-button" onClick={closeMenu}>
						{navLinks[3].name}
					</a>
				</div>
			</div>
		</>
	);
}

export default Navbar;
