// src/components/GroupDisplay/GroupDisplay.tsx
import React, { useState, useEffect } from "react";
import { type Participant, type Group } from "../../types";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { motion, AnimatePresence } from "framer-motion";
import "./GroupDisplay.scss";

interface GroupDisplayProps {
  participants: Participant[];
  onGroupsFinalized: () => void; // Callback for when user is done viewing groups
  onBackToChoice: () => void; // Callback to go back to draw mode choice
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GroupDisplay: React.FC<GroupDisplayProps> = ({
  participants,
  onGroupsFinalized,
  onBackToChoice,
}) => {
  const [participantsPerGroup, setParticipantsPerGroup] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>("");
  const [showGroups, setShowGroups] = useState<boolean>(false);

  const handleGroupSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perGroup = parseInt(participantsPerGroup, 10);

    if (isNaN(perGroup) || perGroup <= 0) {
      setError("Please enter a valid number greater than 0.");
      return;
    }
    if (perGroup > participants.length) {
      setError(
        `Cannot have more participants per group (${perGroup}) than total participants (${participants.length}).`
      );
      return;
    }

    setError("");
    generateGroups(perGroup);
    setShowGroups(true);
  };

  const generateGroups = (perGroup: number) => {
    const shuffledParticipants = shuffleArray([...participants]);
    const numGroups = Math.ceil(shuffledParticipants.length / perGroup);
    const newGroups: Group[] = [];

    for (let i = 0; i < numGroups; i++) {
      const groupParticipants = shuffledParticipants.slice(
        i * perGroup,
        (i + 1) * perGroup
      );
      newGroups.push({
        id: `group-${Date.now()}-${i}`,
        name: `Group ${i + 1}`,
        participants: groupParticipants,
      });
    }
    setGroups(newGroups);
  };

  const resetGroupSetup = () => {
    setShowGroups(false);
    setParticipantsPerGroup("");
    setGroups([]);
    setError("");
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child (group card) animates one after another
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  if (!showGroups) {
    return (
      <motion.div
        className="group-setup-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>Setup Groups</h2>
        <p>Total Participants: {participants.length}</p>
        <form onSubmit={handleGroupSizeSubmit}>
          <Input
            label="Participants per Group:"
            type="number"
            value={participantsPerGroup}
            onChange={(e) => setParticipantsPerGroup(e.target.value)}
            placeholder="e.g., 3"
            error={error}
            min="1"
            autoFocus
          />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onBackToChoice}>
              Back to Choice
            </Button>
            <Button type="submit" variant="primary">
              Generate Groups
            </Button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="groups-container"
      initial="hidden"
      animate="visible"
      variants={listVariants}
    >
      <h2>Generated Groups</h2>
      <AnimatePresence>
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            className="group-card"
            variants={itemVariants}
            // Custom prop for Framer Motion to handle dynamic initial/animate based on index for reveal
            custom={index}
            initial="hidden"
            animate="visible"
            layout // Animate layout changes if groups reorder/change
          >
            <h3>{group.name}</h3>
            <ul>
              {group.participants.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="groups-actions">
        <Button variant="secondary" onClick={resetGroupSetup}>
          Try Different Grouping
        </Button>
        <Button variant="primary" onClick={onGroupsFinalized}>
          Done
        </Button>
      </div>
    </motion.div>
  );
};

export default GroupDisplay;
