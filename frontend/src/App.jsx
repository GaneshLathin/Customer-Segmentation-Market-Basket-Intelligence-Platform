import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Segmentation from "./pages/Segmentation";
import DimReduction from "./pages/DimReduction";
import MarketBasket from "./pages/MarketBasket";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/segmentation" element={<Segmentation />} />
            <Route path="/dimensionality" element={<DimReduction />} />
            <Route path="/market-basket" element={<MarketBasket />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
