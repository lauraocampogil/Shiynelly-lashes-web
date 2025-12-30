import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

function ToggleModelService() {
	const [isModelServiceOpen, setIsModelServiceOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadModelServiceStatus();
	}, []);

	const loadModelServiceStatus = async () => {
		try {
			const docRef = doc(db, "settings", "modelService");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setIsModelServiceOpen(docSnap.data().isOpen || false);
			} else {
				// Créer le document s'il n'existe pas
				await setDoc(docRef, { isOpen: false });
				setIsModelServiceOpen(false);
			}
		} catch (error) {
			console.error("Erreur chargement:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleModelService = async () => {
		setSaving(true);
		try {
			const newStatus = !isModelServiceOpen;
			await setDoc(doc(db, "settings", "modelService"), {
				isOpen: newStatus,
				lastUpdated: new Date(),
			});

			setIsModelServiceOpen(newStatus);
			alert(newStatus ? "✅ Service Modèle ACTIVÉ - Les clients peuvent maintenant réserver!" : "❌ Service Modèle DÉSACTIVÉ - Les clients ne peuvent plus réserver.");
		} catch (error) {
			console.error("Erreur:", error);
			alert("Erreur lors de la mise à jour");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="loading">Chargement...</div>;

	return (
		<div className="toggle-model-service">
			<div className="section-header">
				<h2>
					<i className="fa-solid fa-toggle-on"></i> Service Modèle - Disponibilité
				</h2>
			</div>

			<div className="toggle-container">
				<div className={`status-card ${isModelServiceOpen ? "open" : "closed"}`}>
					<div className="status-icon">{isModelServiceOpen ? <i className="fa-solid fa-lock-open"></i> : <i className="fa-solid fa-lock"></i>}</div>

					<div className="status-content">
						<h3>Service Modèle Gratuit</h3>
						<p className="status-text">
							{isModelServiceOpen ? (
								<>
									<span className="status-badge open">🟢 OUVERT</span>
									Les clients peuvent réserver ce service gratuitement via le formulaire de réservation.
								</>
							) : (
								<>
									<span className="status-badge closed">🔴 FERMÉ</span>
									Les clients voient ce service mais ne peuvent pas le réserver pour le moment.
								</>
							)}
						</p>

						<div className="info-box">
							<i className="fa-solid fa-info-circle"></i>
							<div>
								<strong>Comment ça marche?</strong>
								<ul>
									<li>
										<strong>OUVERT:</strong> Le service apparaît dans le formulaire de réservation. Les clients peuvent prendre rendez-vous gratuitement.
									</li>
									<li>
										<strong>FERMÉ:</strong> Le service est visible dans "Nos Prestations" avec un badge "Actuellement indisponible". Les clients ne peuvent pas le réserver.
									</li>
								</ul>
							</div>
						</div>

						<button onClick={toggleModelService} className={`toggle-button ${isModelServiceOpen ? "close-button" : "open-button"}`} disabled={saving}>
							{saving ? (
								<>
									<i className="fa-solid fa-spinner fa-spin"></i> Mise à jour...
								</>
							) : isModelServiceOpen ? (
								<>
									<i className="fa-solid fa-lock"></i> Fermer le Service Modèle
								</>
							) : (
								<>
									<i className="fa-solid fa-lock-open"></i> Ouvrir le Service Modèle
								</>
							)}
						</button>
					</div>
				</div>

				{/* Exemple visuel */}
				<div className="preview-section">
					<h4>
						<i className="fa-solid fa-eye"></i> Ce que voient les clients:
					</h4>

					<div className="preview-cards">
						<div className="preview-card">
							<h5>📋 Dans "Nos Prestations"</h5>
							<div className="preview-content">
								<p>
									<strong>Modèle - Entraînement</strong>
								</p>
								<p className="preview-price">Gratuit</p>
								{isModelServiceOpen ? (
									<span className="preview-badge open">
										<i className="fa-solid fa-circle-check"></i> Disponible
									</span>
								) : (
									<span className="preview-badge closed">Actuellement indisponible</span>
								)}
							</div>
						</div>

						<div className="preview-card">
							<h5>📝 Dans le Formulaire de Réservation</h5>
							<div className="preview-content">
								{isModelServiceOpen ? (
									<>
										<p className="preview-success">
											<i className="fa-solid fa-circle-check"></i> <strong>Le service apparaît</strong> dans la liste des services disponibles
										</p>
										<p>Les clients peuvent le sélectionner et réserver</p>
									</>
								) : (
									<>
										<p className="preview-info">
											⚠️ <strong>Le service N'apparaît PAS</strong> dans la liste
										</p>
										<p>Les clients ne peuvent pas le réserver</p>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ToggleModelService;
