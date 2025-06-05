// src/components/ParticipantInputForm/ParticipantInputForm.tsx
import React, { useState } from "react";
import { type Participant } from "../../types";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { motion, AnimatePresence } from "framer-motion";
import "./ParticipantInputForm.scss";

interface ParticipantInputFormProps {
  onParticipantsSet: (participants: Participant[]) => void;
}

const ParticipantInputForm: React.FC<ParticipantInputFormProps> = ({
  onParticipantsSet,
}) => {
  const [numParticipants, setNumParticipants] = useState<string>("");
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1 for number, 2 for names
  const [errors, setErrors] = useState<{ num?: string; names?: string[] }>({});

  const handleNumParticipantsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(numParticipants, 10);
    if (isNaN(num) || num <= 0 || num > 50) {
      // Max 50 participants for sanity
      setErrors({ num: "Please enter a valid number between 1 and 50." });
      return;
    }
    setErrors({});
    setParticipantNames(Array(num).fill(""));
    setCurrentStep(2);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...participantNames];
    newNames[index] = value;
    setParticipantNames(newNames);
    // Clear specific name error if user starts typing
    if (errors.names && errors.names[index] && value.trim() !== "") {
      const newNameErrors = [...(errors.names || [])];
      newNameErrors[index] = "";
      setErrors((prev) => ({ ...prev, names: newNameErrors }));
    }
  };

  const handleNamesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNameErrors: string[] = Array(participantNames.length).fill("");
    let hasError = false;
    const finalParticipants: Participant[] = participantNames.map((name, index) => {
      if (name.trim() === "") {
        newNameErrors[index] = "Name cannot be empty.";
        hasError = true;
      }
      return { id: `p-${Date.now()}-${index}`, name: name.trim() };
    });

    if (hasError) {
      setErrors({ names: newNameErrors });
      return;
    }

    setErrors({});
    onParticipantsSet(finalParticipants);
  };

  return (
    <motion.div
      className="participant-input-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.form
            key="step1"
            onSubmit={handleNumParticipantsSubmit}
            className="form-step"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Enter Setup Details</h2>
            <Input
              label="Number of Participants:"
              type="number"
              value={numParticipants}
              onChange={(e) => setNumParticipants(e.target.value)}
              placeholder="e.g., 5"
              error={errors.num}
              min="1"
              max="50"
              autoFocus
            />
            <Button type="submit" variant="primary" className="btn--full-width">
              Next
            </Button>
          </motion.form>
        )}

        {currentStep === 2 && (
          <motion.form
            key="step2"
            onSubmit={handleNamesSubmit}
            className="form-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Enter Participant Names</h2>
            {participantNames.map((name, index) => (
              <Input
                key={index}
                label={`Participant ${index + 1}:`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder="Enter name"
                error={errors.names?.[index]}
                autoFocus={index === 0}
              />
            ))}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentStep(1);
                  setErrors({});
                  setNumParticipants(String(participantNames.length));
                }}
              >
                Back
              </Button>
              <Button type="submit" variant="primary">
                Start Wheel!
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParticipantInputForm;
