import Logo from "../assets/images/Logo/Logo-SL-nobg.png";
function Navbar() {
	return (
		<nav className="navbar">
			<a href="./">
				<img src={Logo} alt="Shiynelly Lashes Logo" className="logo" />
			</a>
		</nav>
	);
}
export default Navbar;
