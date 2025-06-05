// src/components/Wheel/Wheel.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { type Participant } from "../../types";
import Button from "../Button/Button";
import "./Wheel.scss";

interface WheelProps {
  participants: Participant[];
  onSpinComplete: (winner: Participant) => void;
  onBackToChoice: () => void;
}

// Helper to generate distinct colors
const generateSegmentColors = (numSegments: number): string[] => {
  const colors: string[] = [];
  const baseColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FED766",
    "#2AB7CA",
    "#F0B67F",
    "#FE4A49",
    "#547980",
    "#8A9B0F",
    "#F7CAC9",
    "#92A8D1",
    "#034F84",
    "#FFC425",
    "#E8A87C",
    "#C38D9E",
    "#41B3A3",
    "#F172A1",
    "#A1C3D1",
    "#B39BC8",
    "#F3E5AB",
  ];
  for (let i = 0; i < numSegments; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

const Wheel: React.FC<WheelProps> = ({
  participants,
  onSpinComplete,
  onBackToChoice,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [colors, setColors] = useState<string[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const numSegments = participants.length;
  const segmentAngle = 360 / numSegments;

  useEffect(() => {
    setColors(generateSegmentColors(numSegments));
  }, [numSegments]);

  const handleSpin = () => {
    if (isSpinning || numSegments === 0) return;

    setIsSpinning(true);
    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full spins
    const winningSegmentIndex = Math.floor(Math.random() * numSegments);
    const targetRotation =
      360 * randomSpins - winningSegmentIndex * segmentAngle - segmentAngle / 2;

    // Adjust targetRotation to ensure it's a positive value and relative to current rotation for smooth animation
    // The actual target angle for Framer Motion should be cumulative
    const finalRotation = rotation + targetRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = participants[winningSegmentIndex];
      onSpinComplete(winner);

      // Optional: Reset visual rotation if needed, or keep it for next spin reference
      // const normalizedRotation = finalRotation % 360;
      // setRotation(normalizedRotation); // Keep it where it landed visually
    }, 3000 + 200); // Corresponds to Framer Motion transition duration + a small buffer
  };

  if (numSegments === 0) {
    return (
      <div className="wheel-container empty-wheel">
        <p>No participants to display on the wheel.</p>
        <Button onClick={onBackToChoice} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="wheel-container">
      <h2>Spin the Wheel!</h2>
      <div className="wheel-assembly">
        <div className="wheel-pointer">▼</div>
        <motion.div
          ref={wheelRef}
          className="wheel"
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 40, damping: 15, duration: 3 }} // Spring for a more natural spin
        >
          {participants.map((participant, index) => {
            const angle = segmentAngle * index;
            const midAngleRad = ((angle + segmentAngle / 2) * Math.PI) / 180;
            // Position text towards the outer edge. Adjust radius (e.g., 35-40%)
            const textRadius = numSegments > 6 ? "38%" : "30%"; // Closer for fewer segments
            const textX = Math.cos(midAngleRad) * parseFloat(textRadius);
            const textY = Math.sin(midAngleRad) * parseFloat(textRadius);

            return (
              <div
                key={participant.id}
                className="wheel-segment"
                style={{
                  transform: `rotate(${angle}deg) skewY(${90 - segmentAngle}deg)`,
                  backgroundColor: colors[index % colors.length],
                }}
              >
                <div
                  className="segment-text"
                  style={{
                    // Counter-rotate and un-skew text
                    transform: `skewY(-${90 - segmentAngle}deg) rotate(${
                      segmentAngle / 2
                    }deg) translate(-50%, -50%)`,
                    // Experimental text positioning - this is tricky with skew
                    // For highly skewed small segments, text might be hard to read or position.
                    // A simpler approach is often to label outside the wheel or use fewer segments.
                    // The below is a very rough attempt, might need more complex SVG or canvas for perfect text on wedge.
                    position: "absolute",
                    top: "50%", // These are relative to the skewed segment
                    left: "50%", //
                    // This text positioning part for CSS wedges is notoriously difficult.
                    // A common alternative is to have names around the wheel or use a canvas library.
                  }}
                >
                  {/* For simplicity, placing text requires careful CSS.
                      The current approach has text centered in the skewed segment.
                      More advanced text placement might require overlaying text elements
                      or using SVG for segments.
                  */}
                  <span
                    className="participant-name"
                    style={{
                      // Attempt to keep text somewhat upright and centered
                      // The display and rotation are tricky within skewed elements
                      display: "inline-block",
                      transform: `rotate(${-90}deg)`, // Try to make text radial
                      whiteSpace: "nowrap",
                      maxWidth: numSegments > 8 ? "60px" : "80px", // Prevent overflow
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {participant.name}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
      <div className="wheel-controls">
        <Button onClick={onBackToChoice} variant="secondary" disabled={isSpinning}>
          Back to Choice
        </Button>
        <Button
          onClick={handleSpin}
          disabled={isSpinning || numSegments === 0}
          variant="primary"
        >
          {isSpinning ? "Spinning..." : "Spin!"}
        </Button>
      </div>
    </div>
  );
};

export default Wheel;
