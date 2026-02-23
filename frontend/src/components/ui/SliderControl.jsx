export default function SliderControl({ label, value, min, max, step = 1, onChange }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
                <span className="font-medium" style={{ color: "#64748b" }}>{label}</span>
                <span className="font-bold tabular-nums" style={{ color: "#7c3aed" }}>{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                style={{
                    background: `linear-gradient(to right, #7c3aed ${((value - min) / (max - min)) * 100}%, #e2e8f0 0%)`,
                }}
            />
            <div className="flex justify-between text-xs" style={{ color: "#94a3b8" }}>
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}
