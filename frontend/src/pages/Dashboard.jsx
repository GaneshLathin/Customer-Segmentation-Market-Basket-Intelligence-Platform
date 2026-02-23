import { motion } from "framer-motion";
import { Users, ShoppingBag, Package, Globe, TrendingUp, DollarSign } from "lucide-react";
import { useAPI } from "../hooks/useAPI";
import { fetchDatasetStats } from "../services/api";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

const CLUSTER_DIST = [
    { name: "Champions", value: 22 },
    { name: "Loyal", value: 31 },
    { name: "At-Risk", value: 18 },
    { name: "New", value: 19 },
    { name: "Lost", value: 10 },
];

const ALGO_COMPARISON = [
    { name: "K-Means", silhouette: 0.42, clusters: 4 },
    { name: "Hierarchical", silhouette: 0.38, clusters: 4 },
    { name: "DBSCAN", silhouette: 0.31, clusters: 3 },
];

function LoadingCard() {
    return <div className="glass rounded-2xl p-5 shimmer h-28" />;
}

export default function Dashboard() {
    const { data, loading, error } = useAPI(fetchDatasetStats, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {loading ? (
                    Array(6).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : error ? (
                    <div className="col-span-6 glass rounded-2xl p-6 text-center" style={{ color: "#ef4444" }}>
                        <p className="font-semibold">Backend not connected</p>
                        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Start the FastAPI server: <code style={{ color: "#7c3aed" }}>uvicorn main:app --reload</code></p>
                    </div>
                ) : (
                    <>
                        <StatCard icon={ShoppingBag} label="Total Transactions" value={data?.total_transactions} sub="Real data" color="#8b5cf6" delay={0} />
                        <StatCard icon={Users} label="Unique Customers" value={data?.total_customers} sub="Analyzed" color="#06b6d4" delay={0.05} />
                        <StatCard icon={Package} label="Unique Products" value={data?.total_products} sub="SKUs" color="#f59e0b" delay={0.1} />
                        <StatCard icon={DollarSign} label="Total Revenue" value={`£${(data?.total_revenue / 1000).toFixed(0)}K`} sub="GBP" color="#10b981" delay={0.15} />
                        <StatCard icon={TrendingUp} label="Avg Order Value" value={`£${data?.avg_order_value?.toFixed(2)}`} sub="Per invoice" color="#ef4444" delay={0.2} />
                        <StatCard icon={Globe} label="Countries" value={data?.countries} sub="Markets" color="#f97316" delay={0.25} />
                    </>
                )}
            </div>

            {/* Date range */}
            {data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="glass rounded-xl px-5 py-3 flex items-center gap-4 text-xs" style={{ color: "#64748b" }}>
                    <span className="font-semibold" style={{ color: "#1e293b" }}>📅 Dataset Period:</span>
                    <span>{data.date_range?.start} → {data.date_range?.end}</span>
                    <span className="ml-auto" style={{ color: "#7c3aed" }}>UCI Online Retail II (id=502)</span>
                </motion.div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Customer Segment Distribution" description="Expected cluster distribution across personas">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={CLUSTER_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                {CLUSTER_DIST.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {CLUSTER_DIST.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                {d.name} ({d.value}%)
                            </div>
                        ))}
                    </div>
                </ChartCard>

                <ChartCard title="Algorithm Comparison" description="Silhouette scores across clustering methods">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={ALGO_COMPARISON} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 0.6]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                            <Bar dataKey="silhouette" radius={[6, 6, 0, 0]}>
                                {ALGO_COMPARISON.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "RFM Analysis", desc: "Recency, Frequency, Monetary features engineered from real invoice data. Log-transformed to handle skewness.", tag: "Feature Engineering" },
                    { title: "Noise Detection", desc: "DBSCAN identifies anomalous customers who don't fit any cluster profile. Useful for fraud or data quality issues.", tag: "DBSCAN" },
                    { title: "Association Rules", desc: "Apriori algorithm mines frequent itemsets from real basket data. Top rules sorted by lift ratio.", tag: "Market Basket" },
                ].map((c) => (
                    <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>{c.tag}</span>
                        <h3 className="text-sm font-semibold mt-3 mb-2" style={{ color: "#1e293b" }}>{c.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{c.desc}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
