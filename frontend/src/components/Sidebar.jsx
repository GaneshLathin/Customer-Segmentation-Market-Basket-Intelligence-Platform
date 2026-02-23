import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    GitBranch,
    ShoppingCart,
    FileBarChart2,
    ChevronLeft,
    ChevronRight,
    Brain,
    Layers,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/segmentation", icon: Users, label: "Segmentation" },
    { to: "/dimensionality", icon: Layers, label: "Dim. Reduction" },
    { to: "/market-basket", icon: ShoppingCart, label: "Market Basket" },
    { to: "/reports", icon: FileBarChart2, label: "Reports" },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative flex flex-col h-full overflow-hidden"
            style={{ backgroundColor: "#ffffff", borderRight: "1px solid #e9ecf3" }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid #e9ecf3" }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Brain size={16} className="text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <p className="text-sm font-bold tracking-tight" style={{ color: "#1e293b" }}>SegmentIQ</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>Intelligence Platform</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-4 space-y-1 px-2">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                    const active = location.pathname === to || location.pathname.startsWith(to + "/");
                    return (
                        <NavLink key={to} to={to}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200`}
                                style={active
                                    ? { background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#7c3aed" }
                                    : { color: "#64748b" }
                                }
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c3aed"; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#64748b"; } }}
                            >
                                <Icon size={18} className="flex-shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            {label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10"
                style={{ background: "#7c3aed", border: "2px solid #ede9fe", color: "#fff" }}
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </motion.aside>
    );
}
