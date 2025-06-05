// src/components/Animations/FireworkParticle.tsx
import React from "react";
import { motion } from "framer-motion";

interface FireworkParticleProps {
  id: number;
  x: number; // initial x (center)
  y: number; // initial y (center)
  hue: number; // color hue (0-360)
  onComplete: (id: number) => void; // To remove particle after animation
}

const FireworkParticle: React.FC<FireworkParticleProps> = ({
  id,
  /* x, y are now implicit 0,0 */ hue,
  onComplete,
}) => {
  const travelDistance = Math.random() * 100 + 70;
  const angle = Math.random() * Math.PI * 2;
  // These endX/endY are now the target transforms from the particle's origin (0,0 within its container)
  const endX = Math.cos(angle) * travelDistance;
  const endY = Math.sin(angle) * travelDistance;
  const duration = Math.random() * 0.8 + 0.5;
  const size = Math.random() * 5 + 3;

  return (
    <motion.div
      key={id}
      style={{
        position: "absolute", // Will be positioned relative to the .fireworks-container
        left: 0, // Starts at the center of .fireworks-container
        top: 0,
        width: size,
        height: size,
        backgroundColor: `hsl(${hue}, 100%, 70%)`,
        borderRadius: "50%",
        boxShadow: `0 0 8px hsl(${hue}, 100%, 70%), 0 0 12px hsl(${hue}, 100%, 50%)`,
      }}
      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }} // Start at center
      animate={{
        x: endX, // Animate to the calculated end position
        y: endY,
        opacity: 0,
        scale: [1, 1.2, 0.2],
      }}
      transition={{ duration: duration, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(id)}
    />
  );
};

export default FireworkParticle;
