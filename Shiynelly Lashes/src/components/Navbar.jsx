import Logo from "../assets/images/Logo/Logo-SL-white-nobg.png";
import { navLinks } from "../../constants/index.js";
function Navbar() {
	return (
		<nav className="navbar">
			<div className="navbar-container">
				<a href="./" className="navbar-logo">
					<img src={Logo} alt="Shiynelly Lashes Logo" />
					<span className="logo-text">Shiynelly Lashes</span>
				</a>

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
			</div>
		</nav>
	);
}
export default Navbar;
