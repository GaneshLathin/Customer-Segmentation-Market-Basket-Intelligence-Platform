import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, TrendingUp } from "lucide-react";
import { useAPI } from "../hooks/useAPI";
import { fetchMarketBasket } from "../services/api";
import SliderControl from "../components/ui/SliderControl";
import ChartCard from "../components/ui/ChartCard";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const RULE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#f97316"];

function HeatmapChart({ heatmap }) {
    if (!heatmap?.length) return null;

    const rows = [...new Set(heatmap.map(d => d.row))].slice(0, 12);
    const cols = [...new Set(heatmap.map(d => d.col))].slice(0, 12);
    const maxVal = Math.max(...heatmap.map(d => d.value), 1);

    const lookup = {};
    heatmap.forEach(d => { lookup[`${d.row}||${d.col}`] = d.value; });

    return (
        <div className="overflow-x-auto">
            <div style={{ minWidth: 600 }}>
                {/* Column headers */}
                <div className="flex" style={{ marginLeft: 130 }}>
                    {cols.map(c => (
                        <div key={c} className="text-center" style={{ width: 42, fontSize: 8, color: "#94a3b8", writingMode: "vertical-rl", transform: "rotate(180deg)", height: 80, paddingBottom: 4 }}>
                            {c.slice(0, 18)}
                        </div>
                    ))}
                </div>
                {/* Rows */}
                {rows.map(r => (
                    <div key={r} className="flex items-center mb-0.5">
                        <div className="text-right pr-2 text-slate-400 flex-shrink-0" style={{ width: 130, fontSize: 9 }}>{r.slice(0, 22)}</div>
                        {cols.map(c => {
                            const val = lookup[`${r}||${c}`] || 0;
                            const intensity = val / maxVal;
                            const bg = intensity > 0
                                ? `rgba(139, 92, 246, ${0.15 + intensity * 0.85})`
                                : "rgba(255,255,255,0.02)";
                            return (
                                <div key={c} title={`${r} ↔ ${c}: ${val}`}
                                    style={{ width: 42, height: 24, backgroundColor: bg, margin: "0 1px", borderRadius: 2, flexShrink: 0 }}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Darker purple = higher co-occurrence in same basket</p>
        </div>
    );
}

export default function MarketBasket() {
    const [support, setSupport] = useState(0.02);
    const [confidence, setConfidence] = useState(0.3);

    const fetchFn = useCallback(
        () => fetchMarketBasket(support, confidence),
        [support, confidence]
    );
    const { data, loading, error } = useAPI(fetchFn, [support, confidence]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold font-semibold" style={{ color: "#1e293b" }}>Market Basket Analysis</h2>
                    <p className="text-xs text-slate-400 mt-1">Apriori algorithm on real invoice transactions — top 50 products</p>
                </div>
                {data && (
                    <div className="flex gap-4 text-xs text-xs" style={{ color: "#94a3b8" }}>
                        <span>Frequent Itemsets: <span className="text-violet-400 font-bold">{data.total_frequent_itemsets}</span></span>
                        <span>Total Rules: <span className="text-cyan-400 font-bold">{data.total_rules}</span></span>
                    </div>
                )}
            </div>

            {/* Parameter controls */}
            <div className="glass rounded-xl p-5 grid grid-cols-2 gap-6 max-w-lg">
                <SliderControl label="Min Support" value={support} min={0.01} max={0.2} step={0.01} onChange={setSupport} />
                <SliderControl label="Min Confidence" value={confidence} min={0.1} max={1.0} step={0.05} onChange={setConfidence} />
            </div>

            {loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl shimmer h-80" />
                    <div className="glass rounded-2xl shimmer h-80" />
                </div>
            )}

            {error && (
                <div className="glass rounded-xl p-8 text-center border border-red-500/20">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                    <p className="text-xs text-slate-500 mt-2">Start backend: <code className="text-violet-400">uvicorn main:app --reload</code></p>
                </div>
            )}

            {data && (
                <>
                    {/* Top item frequency */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Top 20 Products by Purchase Frequency" description="Most frequently purchased items in the real dataset">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={data.item_frequency} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="item" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#1e293b", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {data.item_frequency?.map((_, i) => <Cell key={i} fill={RULE_COLORS[i % RULE_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Top rules */}
                        <ChartCard title="Top Association Rules (by Lift)" description="Rules with highest lift indicate strongest product relationships">
                            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0" style={{ background: "#f8f9fc" }}>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-2 text-xs" style={{ color: "#94a3b8" }}>Antecedent → Consequent</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Support</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Conf</th>
                                            <th className="text-right py-2 text-xs" style={{ color: "#94a3b8" }}>Lift</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.top_rules?.map((r, i) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-violet-50/30">
                                                <td className="py-2 text-slate-300 max-w-xs">
                                                    <span className="text-violet-400">{r.antecedents}</span>
                                                    <span className="text-slate-500 mx-1">→</span>
                                                    <span className="text-cyan-400">{r.consequents}</span>
                                                </td>
                                                <td className="text-right py-2 text-slate-400 tabular-nums">{r.support}</td>
                                                <td className="text-right py-2 text-slate-400 tabular-nums">{r.confidence}</td>
                                                <td className="text-right py-2 font-bold tabular-nums" style={{ color: r.lift > 3 ? "#10b981" : r.lift > 1.5 ? "#f59e0b" : "#94a3b8" }}>
                                                    {r.lift}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>
                    </div>

                    {/* Heatmap */}
                    <ChartCard title="Product Co-occurrence Heatmap" description="How often pairs of products appear in the same basket (top 12×12)">
                        <HeatmapChart heatmap={data.heatmap} />
                    </ChartCard>

                    {/* Interpretation cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: "Support", color: "#8b5cf6", desc: "Fraction of baskets containing the itemset. Higher support = more common pattern.", formula: "supp(A→B) = P(A ∪ B)" },
                            { title: "Confidence", color: "#06b6d4", desc: "How often the rule is correct. P(B|A) — probability of B given A was purchased.", formula: "conf(A→B) = P(A ∪ B) / P(A)" },
                            { title: "Lift", color: "#f59e0b", desc: "Lift > 1 means items are bought together more than by chance. Key metric for actionable rules.", formula: "lift = conf / P(B)" },
                        ].map((m) => (
                            <div key={m.title} className="glass rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={16} style={{ color: m.color }} />
                                    <h3 className="text-sm font-semibold font-semibold" style={{ color: "#1e293b" }}>{m.title}</h3>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{m.desc}</p>
                                <code className="text-xs px-2 py-1 rounded" style={{ background: m.color + "22", color: m.color }}>{m.formula}</code>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
}
