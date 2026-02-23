import { motion } from "framer-motion";

const CLUSTER_COLORS = ["#7c3aed", "#0891b2", "#d97706", "#059669", "#dc2626", "#ea580c"];

export default function TabSwitcher({ tabs, active, onChange }) {
    return (
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{ color: active === tab.id ? "#fff" : "#64748b" }}
                >
                    {active === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {tab.icon && <tab.icon size={14} />}
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}

export { CLUSTER_COLORS };
