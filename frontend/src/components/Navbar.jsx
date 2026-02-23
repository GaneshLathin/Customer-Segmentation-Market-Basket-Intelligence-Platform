import { useLocation } from "react-router-dom";
import { Database } from "lucide-react";

const BREADCRUMBS = {
    "/dashboard": "Dashboard",
    "/segmentation": "Customer Segmentation",
    "/dimensionality": "Dimensionality Reduction",
    "/market-basket": "Market Basket Analysis",
    "/reports": "Cluster Reports & Insights",
};

export default function Navbar() {
    const { pathname } = useLocation();
    const title = BREADCRUMBS[pathname] || "Overview";

    return (
        <header className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e9ecf3" }}>
            <div>
                <h1 className="text-base font-semibold" style={{ color: "#1e293b" }}>{title}</h1>
                <p className="text-xs" style={{ color: "#94a3b8" }}>UCI Online Retail II · Real ML Analysis</p>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "#f5f3ff", border: "1px solid rgba(124,58,237,0.15)", color: "#64748b" }}>
                <Database size={12} style={{ color: "#7c3aed" }} />
                <span>Backend: <span style={{ color: "#7c3aed" }}>localhost:8000</span></span>
            </div>
        </header>
    );
}
