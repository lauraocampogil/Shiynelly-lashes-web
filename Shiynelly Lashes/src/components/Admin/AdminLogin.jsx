import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config.js";
import "./AdminPanel.css";

function AdminLogin({ onLoginSuccess }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await signInWithEmailAndPassword(auth, email, password);
			onLoginSuccess();
		} catch (error) {
			setError("Email ou mot de passe incorrect");
			console.error("Login error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-login-container">
			<div className="admin-login-box">
				<h1>🔐 Admin Panel</h1>
				<p>Connexion requise</p>

				<form onSubmit={handleLogin} className="admin-login-form">
					<div className="form-group">
						<label>Email</label>
						<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
					</div>

					<div className="form-group">
						<label>Mot de passe</label>
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
					</div>

					{error && <div className="error-message">{error}</div>}

					<button type="submit" disabled={loading} className="login-button">
						{loading ? "Connexion..." : "Se connecter"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default AdminLogin;
