import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminPanel from "./components/Admin/AdminPanel";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/admin" element={<AdminPanel />} />
				<Route path="*" element={<Home />} />
			</Routes>
		</Router>
	);
}
