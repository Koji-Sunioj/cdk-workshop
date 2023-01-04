import { Routes, Route, BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import Prices from "./pages/Prices";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <br />
      <Routes>
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Prices />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
