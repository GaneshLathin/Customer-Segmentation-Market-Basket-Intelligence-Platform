import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GitBranch, Cpu, RefreshCw } from "lucide-react";
import { useAPI } from "../hooks/useAPI";
import { fetchKMeans, fetchHierarchical, fetchDBSCAN } from "../services/api";
import TabSwitcher, { CLUSTER_COLORS } from "../components/ui/TabSwitcher";
import SliderControl from "../components/ui/SliderControl";
import ChartCard from "../components/ui/ChartCard";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, BarChart, Bar, Legend,
} from "recharts";

const TABS = [
    { id: "kmeans", label: "K-Means", icon: Users },
    { id: "hierarchical", label: "Hierarchical", icon: GitBranch },
    { id: "dbscan", label: "DBSCAN", icon: Cpu },
];

// ─── Simple D3-like Dendrogram Renderer ──────────────────────────────────────
function DendrogramSVG({ data }) {
    if (!data) return null;
    const W = 640, H = 320, MARGIN = { top: 20, right: 20, bottom: 20, left: 40 };

    // Collect all nodes + compute positions via BFS
    const nodes = [], links = [];
    let leafIndex = 0;
    const maxHeight = data.height || 10;

    function traverse(node, depth, parentX, parentY) {
        if (!node) return null;
        if (node.left || node.right) {
            const lPos = traverse(node.left, depth + 1, null, null);
            const rPos = traverse(node.right, depth + 1, null, null);
            const x = lPos && rPos ? (lPos.x + rPos.x) / 2 : (lPos || rPos)?.x || 0;
            const y = MARGIN.top + (1 - (node.height || 0) / maxHeight) * (H - MARGIN.top - MARGIN.bottom);
            nodes.push({ id: node.id, x, y, isInternal: true });
            if (lPos) links.push({ x1: x, y1: y, x2: lPos.x, y2: lPos.y });
            if (rPos) links.push({ x1: x, y1: y, x2: rPos.x, y2: rPos.y });
            return { x, y };
        } else {
            const x = MARGIN.left + leafIndex * ((W - MARGIN.left - MARGIN.right) / 30);
            const y = H - MARGIN.bottom;
            leafIndex++;
            nodes.push({ id: node.id, x, y, isInternal: false });
            return { x, y };
        }
    }
    traverse(data, 0, null, null);

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="text-xs" style={{ color: "#94a3b8" }}>
            {links.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#8b5cf6" strokeWidth={1} strokeOpacity={0.6} />
            ))}
            {nodes.filter(n => !n.isInternal).slice(0, 40).map((n, i) => (
                <circle key={i} cx={n.x} cy={n.y} r={2} fill="#06b6d4" opacity={0.8} />
            ))}
        </svg>
    );
}

// ─── K-Means Tab ──────────────────────────────────────────────────────────────
function KMeansTab() {
    const [k, setK] = useState(4);
    const fetchFn = useCallback(() => fetchKMeans(k), [k]);
    const { data, loading, error } = useAPI(fetchFn, [k]);

    return (
        <div className="space-y-6">
            <div className="glass rounded-xl p-5 flex items-center gap-8">
                <div className="w-52">
                    <SliderControl label="Number of Clusters (k)" value={k} min={2} max={10} onChange={setK} />
                </div>
                {data && (
                    <div className="flex gap-6 text-xs text-xs" style={{ color: "#94a3b8" }}>
                        <span>Silhouette: <span className="text-violet-400 font-bold">{data.total_silhouette}</span></span>
                        <span>Customers clustered: <span className="text-cyan-400 font-bold">{data.scatter?.length?.toLocaleString()}</span></span>
                    </div>
                )}
            </div>
            {loading && <div className="glass rounded-2xl p-10 shimmer h-64" />}
            {error && <ErrorMsg msg={error} />}
            {data && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Customer Cluster Scatter (PCA 2D)" description="Customers projected to 2D via PCA, colored by cluster">
                            <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                                    <XAxis dataKey="x" name="PC1" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="y" name="PC2" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                    <Scatter data={data.scatter}>
                                        {data.scatter.map((pt, i) => (
                                            <Cell key={i} fill={CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length]} fillOpacity={0.8} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Elbow Curve" description="Inertia vs. number of clusters — choose the elbow point">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.elbow} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                                    <XAxis dataKey="k" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                    <Line type="monotone" dataKey="inertia" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Silhouette Score per K" description="Higher = better-defined clusters">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.silhouette} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                                    <XAxis dataKey="k" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 0.6]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                        {data.silhouette.map((_, i) => <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard title="Cluster Summary" description="RFM averages per cluster">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-2 text-xs" style={{ color: "#94a3b8" }}>Cluster</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Size</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Recency</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Frequency</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Monetary £</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.cluster_summary?.map((r) => (
                                            <tr key={r.cluster} className="border-b border-slate-100 hover:bg-violet-50/30">
                                                <td className="py-2 font-semibold" style={{ color: CLUSTER_COLORS[r.cluster % CLUSTER_COLORS.length] }}>Cluster {r.cluster}</td>
                                                <td className="text-right py-2 text-slate-700">{r.size?.toLocaleString()}</td>
                                                <td className="text-right py-2 text-slate-700">{r.avg_recency}d</td>
                                                <td className="text-right py-2 text-slate-700">{r.avg_frequency}</td>
                                                <td className="text-right py-2 text-slate-700">£{r.avg_monetary?.toFixed(0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Hierarchical Tab ─────────────────────────────────────────────────────────
function HierarchicalTab() {
    const [nc, setNc] = useState(4);
    const fetchFn = useCallback(() => fetchHierarchical(nc), [nc]);
    const { data, loading, error } = useAPI(fetchFn, [nc]);

    return (
        <div className="space-y-6">
            <div className="glass rounded-xl p-5 flex items-center gap-8">
                <div className="w-52">
                    <SliderControl label="Number of Clusters" value={nc} min={2} max={8} onChange={setNc} />
                </div>
            </div>
            {loading && <div className="glass rounded-2xl p-10 shimmer h-64" />}
            {error && <ErrorMsg msg={error} />}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Dendrogram" description="Hierarchical cluster merging tree (Ward linkage, sample of 500 customers)">
                        <DendrogramSVG data={data.dendrogram} />
                    </ChartCard>
                    <ChartCard title="Cluster Scatter (PCA 2D)" description="Agglomerative clusters projected to 2D">
                        <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                                <XAxis dataKey="x" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="y" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                <Scatter data={data.scatter}>
                                    {data.scatter?.map((pt, i) => <Cell key={i} fill={CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length]} fillOpacity={0.8} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Cluster Summary" description="RFM averages for each hierarchical cluster" className="lg:col-span-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b border-slate-100">
                                    <th className="text-left py-2 text-xs" style={{ color: "#94a3b8" }}>Cluster</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Size</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Recency</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Frequency</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Monetary £</th>
                                </tr></thead>
                                <tbody>
                                    {data.cluster_summary?.map((r) => (
                                        <tr key={r.cluster} className="border-b border-slate-100 hover:bg-violet-50/30">
                                            <td className="py-2 font-semibold" style={{ color: CLUSTER_COLORS[r.cluster % CLUSTER_COLORS.length] }}>Cluster {r.cluster}</td>
                                            <td className="text-right py-2 text-slate-700">{r.size?.toLocaleString()}</td>
                                            <td className="text-right py-2 text-slate-700">{r.avg_recency}d</td>
                                            <td className="text-right py-2 text-slate-700">{r.avg_frequency}</td>
                                            <td className="text-right py-2 text-slate-700">£{r.avg_monetary?.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

// ─── DBSCAN Tab ───────────────────────────────────────────────────────────────
function DBSCANTab() {
    const [eps, setEps] = useState(0.5);
    const [minSamples, setMinSamples] = useState(5);
    const fetchFn = useCallback(() => fetchDBSCAN(eps, minSamples), [eps, minSamples]);
    const { data, loading, error } = useAPI(fetchFn, [eps, minSamples]);

    return (
        <div className="space-y-6">
            <div className="glass rounded-xl p-5 flex flex-wrap items-center gap-8">
                <div className="w-48"><SliderControl label="Epsilon (ε)" value={eps} min={0.1} max={3.0} step={0.1} onChange={setEps} /></div>
                <div className="w-48"><SliderControl label="Min Samples" value={minSamples} min={2} max={20} onChange={setMinSamples} /></div>
                {data && (
                    <div className="flex gap-6 text-xs text-xs" style={{ color: "#94a3b8" }}>
                        <span>Clusters: <span className="text-violet-400 font-bold">{data.n_clusters}</span></span>
                        <span>Noise Points: <span className="text-red-400 font-bold">{data.noise_count}</span></span>
                        <span>Noise Rate: <span className="text-orange-400 font-bold">{data.noise_rate}%</span></span>
                    </div>
                )}
            </div>
            {loading && <div className="glass rounded-2xl p-10 shimmer h-64" />}
            {error && <ErrorMsg msg={error} />}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="DBSCAN Cluster Scatter" description="Red points are noise/anomalies (ε-neighborhood too sparse)">
                        <ResponsiveContainer width="100%" height={320}>
                            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                                <XAxis dataKey="x" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="y" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                                    formatter={(val, name, props) => [val, props.payload.noise ? "🔴 Noise" : `Cluster ${props.payload.cluster}`]} />
                                <Scatter data={data.scatter}>
                                    {data.scatter?.map((pt, i) => (
                                        <Cell key={i} fill={pt.noise ? "#ef4444" : CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length]} fillOpacity={pt.noise ? 0.5 : 0.85} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Cluster & Noise Summary" description="Including anomaly/noise group (cluster = -1)">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead><tr className="border-b border-slate-100">
                                    <th className="text-left py-2 text-xs" style={{ color: "#94a3b8" }}>Label</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Size</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Recency</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Frequency</th>
                                    <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Avg Monetary</th>
                                </tr></thead>
                                <tbody>
                                    {data.cluster_summary?.map((r) => (
                                        <tr key={r.cluster} className="border-b border-slate-100 hover:bg-violet-50/30">
                                            <td className="py-2 font-semibold" style={{ color: r.cluster === -1 ? "#ef4444" : CLUSTER_COLORS[r.cluster % CLUSTER_COLORS.length] }}>{r.label}</td>
                                            <td className="text-right py-2 text-slate-700">{r.size?.toLocaleString()}</td>
                                            <td className="text-right py-2 text-slate-700">{r.avg_recency}d</td>
                                            <td className="text-right py-2 text-slate-700">{r.avg_frequency}</td>
                                            <td className="text-right py-2 text-slate-700">£{r.avg_monetary?.toFixed(0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}

function ErrorMsg({ msg }) {
    return (
        <div className="glass rounded-xl p-5 text-center border border-red-500/20">
            <p className="text-red-400 text-sm">{msg}</p>
            <p className="text-xs text-slate-500 mt-1">Make sure the FastAPI backend is running on port 8000</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Segmentation() {
    const [activeTab, setActiveTab] = useState("kmeans");

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-semibold" style={{ color: "#1e293b" }}>Customer Segmentation</h2>
                    <p className="text-xs text-slate-400 mt-1">Real RFM features from UCI Online Retail II — 4K+ customer profiles</p>
                </div>
                <TabSwitcher tabs={TABS} active={activeTab} onChange={setActiveTab} />
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {activeTab === "kmeans" && <KMeansTab />}
                    {activeTab === "hierarchical" && <HierarchicalTab />}
                    {activeTab === "dbscan" && <DBSCANTab />}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
