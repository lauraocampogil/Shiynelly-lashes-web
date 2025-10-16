import BookingForm from "../components/BookingForm.jsx";
import { useEffect, useRef, useState } from "react";

function Reservation() {
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.3 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<section id="réservation" ref={sectionRef}>
			<div className={`reservation-container ${isVisible ? "fade-in-up" : ""}`}>
				<h2>Réservation</h2>
				<BookingForm />
			</div>
		</section>
	);
}

export default Reservation;
