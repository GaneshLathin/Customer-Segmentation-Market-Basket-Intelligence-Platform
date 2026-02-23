import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#94a3b8"];

function Points3D({ data }) {
    const mesh = useRef();

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(data.length * 3);
        const colors = new Float32Array(data.length * 3);
        data.forEach((pt, i) => {
            positions[i * 3] = pt.x * 3;
            positions[i * 3 + 1] = pt.y * 3;
            positions[i * 3 + 2] = (pt.z || 0) * 3;
            const c = new THREE.Color(COLORS[(pt.cluster === -1 ? 5 : pt.cluster) % COLORS.length]);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        });
        return { positions, colors };
    }, [data]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
        </points>
    );
}

export default function Scatter3D({ data = [] }) {
    if (!data.length) return null;
    return (
        <div style={{ width: "100%", height: 380 }}>
            <Canvas camera={{ position: [5, 5, 8], fov: 50 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <Points3D data={data} />
                <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
