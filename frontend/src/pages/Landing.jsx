import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ArrowRight, Brain, Database, GitBranch, Layers, ShoppingCart } from "lucide-react";
import HeroBackground from "../components/three/HeroBackground";

const FEATURES = [
    { icon: Brain, label: "K-Means Clustering", desc: "Partition customers into k behavioral segments with elbow & silhouette analysis", color: "#7c3aed" },
    { icon: GitBranch, label: "Hierarchical Clustering", desc: "Ward-linkage agglomerative clustering with interactive dendrogram", color: "#0891b2" },
    { icon: Database, label: "DBSCAN", desc: "Density-based clustering with noise & anomaly detection on real data", color: "#d97706" },
    { icon: Layers, label: "PCA & LDA", desc: "Dimensionality reduction for 2D/3D visualization of customer space", color: "#059669" },
    { icon: ShoppingCart, label: "Market Basket", desc: "Apriori association rules — support, confidence, and lift on real transactions", color: "#dc2626" },
];

export default function Landing() {
    const navigate = useNavigate();
    const titleRef = useRef();
    const subRef = useRef();
    const btnRef = useRef();

    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.3 });
        tl.fromTo(titleRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
            .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
            .fromTo(btnRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.3");
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(145deg, #f8f7ff 0%, #eef2ff 40%, #f0f9ff 70%, #f8f7ff 100%)" }}>
            <HeroBackground />

            {/* Soft background tint orbs */}
            <div className="absolute pointer-events-none" style={{
                top: "5%", left: "5%", width: 480, height: 480,
                borderRadius: "50%", filter: "blur(90px)",
                background: "radial-gradient(circle, rgba(109,40,217,0.09) 0%, transparent 70%)",
            }} />
            <div className="absolute pointer-events-none" style={{
                bottom: "5%", right: "5%", width: 420, height: 420,
                borderRadius: "50%", filter: "blur(80px)",
                background: "radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)",
            }} />

            {/* Hero content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#7c3aed" }}
                >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7c3aed" }} />
                    Real ML · UCI Online Retail II Dataset · 541K+ Transactions
                </motion.div>

                <h1
                    ref={titleRef}
                    className="text-5xl md:text-7xl font-black tracking-tight mb-6 opacity-0"
                    style={{ lineHeight: 1.1 }}
                >
                    <span style={{ color: "#1e293b" }}>Customer</span>{" "}
                    <span className="gradient-text">Intelligence</span>
                    <br />
                    <span style={{ color: "#1e293b" }}>Platform</span>
                </h1>

                <p
                    ref={subRef}
                    className="text-lg max-w-2xl mb-10 opacity-0"
                    style={{ color: "#64748b" }}
                >
                    Unsupervised ML-powered customer segmentation using K-Means, Hierarchical Clustering, DBSCAN, PCA/LDA, and Apriori market basket analysis — all on real e-commerce data.
                </p>

                <div ref={btnRef} className="flex gap-4 opacity-0">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}
                    >
                        Launch Platform
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate("/segmentation")}
                        className="px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                        style={{ background: "#ffffff", border: "1.5px solid rgba(124,58,237,0.25)", color: "#7c3aed", boxShadow: "0 2px 12px rgba(124,58,237,0.1)" }}
                    >
                        View Segmentation
                    </button>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mt-16">
                    {[["541K+", "Real Transactions"], ["4K+", "Customers Analyzed"], ["5", "ML Algorithms"], ["Real", "Apriori Rules"]].map(([v, l]) => (
                        <div key={l} className="text-center">
                            <p className="text-2xl font-bold gradient-text">{v}</p>
                            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature cards */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 px-6 pb-12 max-w-6xl mx-auto w-full">
                {FEATURES.map((f, i) => (
                    <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="glass rounded-xl p-4 cursor-pointer transition-all duration-300 group"
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${f.color}22`; e.currentTarget.style.borderColor = `${f.color}33`; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: f.color + "18" }}>
                            <f.icon size={16} style={{ color: f.color }} />
                        </div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "#1e293b" }}>{f.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
