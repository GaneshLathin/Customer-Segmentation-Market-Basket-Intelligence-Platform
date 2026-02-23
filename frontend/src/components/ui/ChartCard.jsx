export default function ChartCard({ title, description, children, className = "" }) {
    return (
        <div className={`glass rounded-2xl p-5 ${className}`}>
            <div className="mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "#1e293b" }}>{title}</h3>
                {description && <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{description}</p>}
            </div>
            <div className="chart-container">{children}</div>
        </div>
    );
}
