import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAPI } from "../hooks/useAPI";
import { fetchReports } from "../services/api";
import SliderControl from "../components/ui/SliderControl";
import ChartCard from "../components/ui/ChartCard";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import {
    Trophy, Heart, Sparkles, AlertTriangle, UserX, Star, TrendingUp,
    Users, Target, Megaphone, DollarSign,
} from "lucide-react";

const ICON_MAP = {
    Trophy, Heart, Sparkles, AlertTriangle, UserX, Star, TrendingUp,
    Users, Target, Megaphone, DollarSign,
};

const CLUSTER_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#f97316"];

function PersonaCard({ persona, index }) {
    const Icon = ICON_MAP[persona.icon] || Users;
    const color = persona.color || CLUSTER_COLORS[index % CLUSTER_COLORS.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="glass rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300 flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color + "22" }}>
                        <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-semibold" style={{ color: "#1e293b" }}>{persona.name}</h3>
                        <p className="text-xs text-xs" style={{ color: "#94a3b8" }}>Cluster {persona.cluster}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black" style={{ color }}>{persona.percentage}%</p>
                    <p className="text-xs text-slate-500">{persona.size?.toLocaleString()} customers</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed">{persona.description}</p>

            {/* RFM Stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: "Recency", value: `${persona.avg_recency}d`, icon: "📅" },
                    { label: "Frequency", value: persona.avg_frequency, icon: "🔁" },
                    { label: "Monetary", value: `£${Math.round(persona.avg_monetary)}`, icon: "💷" },
                ].map((s) => (
                    <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-sm mb-0.5">{s.icon}</p>
                        <p className="text-xs font-bold text-white tabular-nums">{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Radar chart */}
            <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={persona.radar}>
                        <PolarGrid stroke="#1a2035" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Campaign recommendation */}
            <div className="rounded-xl p-3" style={{ background: color + "11", borderLeft: `3px solid ${color}` }}>
                <div className="flex items-center gap-1.5 mb-1">
                    <Megaphone size={11} style={{ color }} />
                    <span className="text-xs font-semibold" style={{ color }}>Campaign Strategy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{persona.campaign}</p>
            </div>
        </motion.div>
    );
}

function SummaryTable({ personas }) {
    if (!personas?.length) return null;
    const total = personas.reduce((s, p) => s + p.size, 0);
    const totalRevPotential = personas.reduce((s, p) => s + p.size * p.avg_monetary, 0);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="text-left py-3 text-xs" style={{ color: "#94a3b8" }}>Persona</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Customers</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Share</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Avg Recency</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Avg Frequency</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Avg Spend £</th>
                        <th className="text-right py-3 text-xs" style={{ color: "#94a3b8" }}>Revenue Potential</th>
                    </tr>
                </thead>
                <tbody>
                    {personas.map((p, i) => {
                        const color = p.color || CLUSTER_COLORS[i % CLUSTER_COLORS.length];
                        const revPotential = p.size * p.avg_monetary;
                        return (
                            <tr key={p.cluster} className="border-b border-slate-100 hover:bg-violet-50/30">
                                <td className="py-3 font-semibold" style={{ color }}>{p.name}</td>
                                <td className="text-right py-3 text-slate-700">{p.size?.toLocaleString()}</td>
                                <td className="text-right py-3 text-slate-700">{p.percentage}%</td>
                                <td className="text-right py-3 text-slate-700">{p.avg_recency}d</td>
                                <td className="text-right py-3 text-slate-700">{p.avg_frequency}</td>
                                <td className="text-right py-3 text-slate-700">£{p.avg_monetary?.toFixed(0)}</td>
                                <td className="text-right py-3 font-bold" style={{ color }}>£{(revPotential / 1000).toFixed(0)}K</td>
                            </tr>
                        );
                    })}
                    <tr className="border-t-2 border-slate-200">
                        <td className="py-3 font-bold font-semibold" style={{ color: "#1e293b" }}>Total</td>
                        <td className="text-right py-3 font-bold font-semibold" style={{ color: "#1e293b" }}>{total?.toLocaleString()}</td>
                        <td className="text-right py-3 font-bold font-semibold" style={{ color: "#1e293b" }}>100%</td>
                        <td colSpan={3} />
                        <td className="text-right py-3 font-bold gradient-text">£{(totalRevPotential / 1000).toFixed(0)}K</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default function Reports() {
    const [k, setK] = useState(4);
    const fetchFn = useCallback(() => fetchReports(k), [k]);
    const { data, loading, error } = useAPI(fetchFn, [k]);

    const personas = data?.personas || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold font-semibold" style={{ color: "#1e293b" }}>Cluster Reports & Insights</h2>
                    <p className="text-xs text-slate-400 mt-1">Marketing personas derived from real K-Means cluster centroids</p>
                </div>
                <div className="w-52">
                    <SliderControl label="Number of Clusters (k)" value={k} min={2} max={8} onChange={setK} />
                </div>
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array(k).fill(0).map((_, i) => (
                        <div key={i} className="glass rounded-2xl shimmer h-96" />
                    ))}
                </div>
            )}

            {error && (
                <div className="glass rounded-xl p-8 text-center border border-red-500/20">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                    <p className="text-xs text-slate-500 mt-2">Start backend: <code className="text-violet-400">cd backend && uvicorn main:app --reload</code></p>
                </div>
            )}

            {!loading && !error && personas.length > 0 && (
                <>
                    {/* Persona cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {personas.map((p, i) => <PersonaCard key={p.cluster} persona={p} index={i} />)}
                    </div>

                    {/* Summary table */}
                    <ChartCard title="Business Intelligence Summary" description="Consolidated cluster report with revenue potential per segment">
                        <SummaryTable personas={personas} />
                    </ChartCard>

                    {/* Business recommendations */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Target size={16} className="text-violet-400" />
                            Strategic Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Retain Champions", body: "Invest in VIP loyalty programs and early-access campaigns for your highest-value customers. Churn here is costliest.", icon: "🏆", color: "#f59e0b" },
                                { title: "Win Back At-Risk", body: "Trigger personalized re-engagement emails with time-limited discounts for customers who haven't purchased in 60+ days.", icon: "⚠️", color: "#ef4444" },
                                { title: "Upsell Loyals", body: "Loyal customers are prime candidates for bundle offers and premium product recommendations to increase basket size.", icon: "❤️", color: "#10b981" },
                                { title: "Onboard New Customers", body: "A structured onboarding journey with welcome offers and product discovery emails can convert new customers to loyals.", icon: "✨", color: "#8b5cf6" },
                            ].map((rec) => (
                                <div key={rec.title} className="flex gap-3 p-4 rounded-xl" style={{ background: rec.color + "0a", border: `1px solid ${rec.color}22` }}>
                                    <span className="text-lg flex-shrink-0">{rec.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1" style={{ color: rec.color }}>{rec.title}</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">{rec.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
