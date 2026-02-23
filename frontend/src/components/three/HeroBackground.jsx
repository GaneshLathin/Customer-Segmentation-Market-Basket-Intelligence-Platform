import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 700 }) {
    const mesh = useRef();

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const palette = [
            new THREE.Color("#6d28d9"),
            new THREE.Color("#0891b2"),
            new THREE.Color("#7c3aed"),
            new THREE.Color("#4f46e5"),
        ];
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        return { positions, colors };
    }, [count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.025;
            mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.055} vertexColors transparent opacity={0.6} sizeAttenuation depthWrite={false} />
        </points>
    );
}

function SoftLines({ count = 40 }) {
    const groupRef = useRef();

    const lines = useMemo(() => {
        return Array.from({ length: count }, () => {
            const start = new THREE.Vector3(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            );
            const end = new THREE.Vector3(
                start.x + (Math.random() - 0.5) * 4,
                start.y + (Math.random() - 0.5) * 4,
                start.z + (Math.random() - 0.5) * 2
            );
            return [start, end];
        });
    }, [count]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.018;
        }
    });

    return (
        <group ref={groupRef}>
            {lines.map((pts, i) => {
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                return (
                    <line key={i} geometry={geo}>
                        <lineBasicMaterial color={i % 2 === 0 ? "#6d28d9" : "#0891b2"} transparent opacity={0.12} depthWrite={false} />
                    </line>
                );
            })}
        </group>
    );
}

export default function HeroBackground() {
    return (
        <Canvas
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
            camera={{ position: [0, 0, 10], fov: 55 }}
            gl={{ antialias: true, alpha: true }}
        >
            <Particles count={700} />
            <SoftLines count={40} />
        </Canvas>
    );
}
