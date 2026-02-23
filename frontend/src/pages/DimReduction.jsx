import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, BarChart2 } from "lucide-react";
import { useAPI } from "../hooks/useAPI";
import { fetchPCA, fetchLDA } from "../services/api";
import TabSwitcher, { CLUSTER_COLORS } from "../components/ui/TabSwitcher";
import ChartCard from "../components/ui/ChartCard";
import Scatter3D from "../components/three/Scatter3D";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, BarChart, Bar,
} from "recharts";

const TABS = [
    { id: "pca", label: "PCA", icon: Layers },
    { id: "lda", label: "LDA", icon: BarChart2 },
];

function PCATab() {
    const { data, loading, error } = useAPI(() => fetchPCA(3), []);

    if (loading) return <div className="glass rounded-2xl shimmer h-80" />;
    if (error) return <ErrorMsg msg={error} />;
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Explained variance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {data.explained_variance?.map((ev) => (
                    <div key={ev.component} className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-black gradient-text">{(ev.variance * 100).toFixed(1)}%</p>
                        <p className="text-xs text-slate-400 mt-1">{ev.component} Explained Variance</p>
                        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                                style={{ width: `${ev.cumulative * 100}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Cumulative: {(ev.cumulative * 100).toFixed(1)}%</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="PCA 2D Projection" description="Customers plotted on first two principal components, colored by K-Means cluster">
                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                            <XAxis dataKey="x" name="PC1" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="y" name="PC2" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                            <Scatter data={data.scatter_2d}>
                                {data.scatter_2d?.map((pt, i) => (
                                    <Cell key={i} fill={CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length]} fillOpacity={0.75} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Explained Variance Ratio" description="Variance captured by each principal component">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data.explained_variance} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                            <XAxis dataKey="component" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => [`${(v * 100).toFixed(2)}%`]} contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                            <Bar dataKey="variance" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* 3D Scatter */}
            <ChartCard title="PCA 3D Scatter Plot (Interactive)" description="Drag to rotate · Scroll to zoom · Clusters auto-rotate">
                <Scatter3D data={data.scatter_3d || []} />
            </ChartCard>

            {/* Component loadings */}
            <ChartCard title="Component Loadings" description="How much each feature contributes to each principal component">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-2 text-xs" style={{ color: "#94a3b8" }}>Feature</th>
                                {data.loadings?.map((l) => (
                                    <th key={l.component} className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>{l.component}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.loadings?.[0] && Object.keys(data.loadings[0].loadings).map((feat) => (
                                <tr key={feat} className="border-b border-slate-100 hover:bg-violet-50/30">
                                    <td className="py-2 text-slate-300 font-medium">{feat}</td>
                                    {data.loadings.map((l) => {
                                        const v = l.loadings[feat];
                                        const color = v > 0.3 ? "#10b981" : v < -0.3 ? "#ef4444" : "#94a3b8";
                                        return <td key={l.component} className="text-right py-2 font-mono" style={{ color }}>{v?.toFixed(3)}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}

function LDATab() {
    const { data, loading, error } = useAPI(() => fetchLDA(2), []);

    if (loading) return <div className="glass rounded-2xl shimmer h-80" />;
    if (error) return <ErrorMsg msg={error} />;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="LDA 2D Projection" description="Fisher's Linear Discriminant — maximizes class separability">
                    <ResponsiveContainer width="100%" height={360}>
                        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                            <XAxis dataKey="x" name="LD1" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="y" name="LD2" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                            <Scatter data={data.scatter}>
                                {data.scatter?.map((pt, i) => (
                                    <Cell key={i} fill={CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length]} fillOpacity={0.8} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="space-y-4">
                    {/* LDA info */}
                    <div className="glass rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white mb-3">About LDA</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Linear Discriminant Analysis (LDA) finds the projection that <strong className="text-violet-400">maximizes between-class variance</strong> and minimizes within-class variance — giving better class separation than PCA.
                        </p>
                        <div className="space-y-2">
                            <p className="text-xs text-xs" style={{ color: "#94a3b8" }}>Labels: <span className="text-cyan-400 font-medium">K-Means (k=4) cluster labels used as class targets</span></p>
                            <p className="text-xs text-xs" style={{ color: "#94a3b8" }}>Components: <span className="text-violet-400 font-medium">{data.n_components} discriminant axes</span></p>
                        </div>
                    </div>

                    {/* Compare PCA vs LDA */}
                    <div className="glass rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white mb-3">PCA vs LDA</h3>
                        <div className="space-y-3 text-xs">
                            {[
                                ["PCA", "Unsupervised", "Max variance", "Global structure"],
                                ["LDA", "Supervised", "Max separability", "Class boundaries"],
                            ].map(([name, type, goal, use]) => (
                                <div key={name} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                                    <span className="font-bold px-2 py-0.5 rounded text-xs" style={{ background: name === "PCA" ? "rgba(139,92,246,0.2)" : "rgba(6,182,212,0.2)", color: name === "PCA" ? "#a78bfa" : "#22d3ee" }}>{name}</span>
                                    <span className="text-xs" style={{ color: "#94a3b8" }}>{type} · {goal} · {use}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.explained_variance?.length > 0 && (
                        <ChartCard title="LDA Discriminant Variance">
                            {data.explained_variance.map((ev) => (
                                <div key={ev.component} className="flex items-center gap-3 mb-2">
                                    <span className="text-xs text-slate-400 w-12">{ev.component}</span>
                                    <div className="flex-1 h-2 rounded-full bg-white/5">
                                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-violet-600"
                                            style={{ width: `${(ev.variance * 100).toFixed(0)}%` }} />
                                    </div>
                                    <span className="text-xs text-cyan-400 font-medium w-12 text-right">{(ev.variance * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </ChartCard>
                    )}
                </div>
            </div>
        </div>
    );
}

function ErrorMsg({ msg }) {
    return (
        <div className="glass rounded-xl p-8 text-center border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">{msg}</p>
            <p className="text-xs text-slate-500 mt-2">Make sure the FastAPI backend is running: <code className="text-violet-400">cd backend && uvicorn main:app --reload</code></p>
        </div>
    );
}

export default function DimReduction() {
    const [activeTab, setActiveTab] = useState("pca");

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-semibold" style={{ color: "#1e293b" }}>Dimensionality Reduction</h2>
                    <p className="text-xs text-slate-400 mt-1">Visualize high-dimensional customer space in 2D & 3D</p>
                </div>
                <TabSwitcher tabs={TABS} active={activeTab} onChange={setActiveTab} />
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {activeTab === "pca" && <PCATab />}
                    {activeTab === "lda" && <LDATab />}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
