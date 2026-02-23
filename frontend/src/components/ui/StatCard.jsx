import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Counter({ target, duration = 1.5 }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const start = Date.now();
        const frame = () => {
            const elapsed = (Date.now() - start) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }, [target, duration]);
    return count.toLocaleString();
}

export default function StatCard({ icon: Icon, label, value, sub, color = "#7c3aed", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="glass rounded-2xl p-5 transition-all duration-300 group"
            style={{ cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${color}22`; e.currentTarget.style.borderColor = `${color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
        >
            <div className="flex items-start justify-between">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: color + "18" }}
                >
                    <Icon size={20} style={{ color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{sub}</span>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#1e293b" }}>
                    {typeof value === "number" ? <Counter target={value} /> : value}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: "#64748b" }}>{label}</p>
            </div>
        </motion.div>
    );
}
