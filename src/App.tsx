// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import "./styles/global.scss"; // Ensure this contains all necessary global styles + component sub-styles if not in App.scss
// import './App.scss'; // Alternatively, if you have App-specific styles

import { type WheelData, type Participant, type Group } from "./types";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  WHEEL_DATA_KEY,
} from "./utils/localStorage";

import Button from "./components/Button/Button";
import Popup from "./components/Popup/Popup";
import ParticipantInputForm from "./components/ParticipantInputForm/ParticipantInputForm";
import GroupDisplay from "./components/GroupDisplay/GroupDisplay";
import Wheel from "./components/Wheel/Wheel";
import FireworkParticle from "./components/Animations/FireworkParticle";

enum AppStage {
  InitialCheck,
  InputCollection,
  DisplayAndChoice,
  GroupDraw,
  IndividualDraw,
  // ShowWinnerPopup is handled by isWinnerPopupOpen state
}

interface ParticleState {
  id: number;
  hue: number;
}

function App() {
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [appStage, setAppStage] = useState<AppStage>(AppStage.InitialCheck);
  const [isInitialPopupOpen, setIsInitialPopupOpen] = useState<boolean>(false);
  const [drawMode, setDrawMode] = useState<"individual" | "group" | null>(null);

  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [isWinnerPopupOpen, setIsWinnerPopupOpen] = useState<boolean>(false);

  const [particles, setParticles] = useState<ParticleState[]>([]);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    // Initial check for existing data in LocalStorage
    const existingData = getLocalStorageItem<WheelData>(WHEEL_DATA_KEY);
    if (
      existingData &&
      existingData.participants &&
      existingData.participants.length > 0
    ) {
      setWheelData(existingData);
      setIsInitialPopupOpen(true);
      setAppStage(AppStage.InitialCheck); // Stay in initial check to show popup
    } else {
      setAppStage(AppStage.InputCollection); // No data, go straight to input collection
    }
  }, []);

  const handleContinueWithExisting = () => {
    setIsInitialPopupOpen(false);
    if (wheelData && wheelData.participants.length > 0) {
      setAppStage(AppStage.DisplayAndChoice);
    } else {
      // Fallback if wheelData is somehow null after popup was shown
      setAppStage(AppStage.InputCollection);
    }
  };

  const handleStartFresh = () => {
    removeLocalStorageItem(WHEEL_DATA_KEY);
    setWheelData(null);
    setIsInitialPopupOpen(false);
    setAppStage(AppStage.InputCollection);
    setDrawMode(null); // Reset draw mode
    setCurrentWinner(null); // Reset winner
    setParticles([]); // Clear any lingering particles
  };

  const handleParticipantsSet = (participants: Participant[]) => {
    const newWheelData = { participants };
    setWheelData(newWheelData);
    setLocalStorageItem(WHEEL_DATA_KEY, newWheelData);
    setAppStage(AppStage.DisplayAndChoice);
  };

  const chooseIndividualDraw = () => {
    setDrawMode("individual");
    setAppStage(AppStage.IndividualDraw);
  };

  const chooseGroupDraw = () => {
    setDrawMode("group");
    setAppStage(AppStage.GroupDraw);
  };

  const resetToInput = () => {
    // This is essentially "Start Fresh" from the DisplayAndChoice screen
    handleStartFresh();
  };

  const handleBackToChoice = () => {
    setAppStage(AppStage.DisplayAndChoice);
  };

  // --- Group Draw Handlers ---
  const handleGroupsFinalized = () => {
    alert("Group draw complete! You can start a new wheel or choose another draw type.");
    setAppStage(AppStage.DisplayAndChoice);
  };

  // --- Individual Draw (Wheel) Handlers ---
  const handleSpinComplete = (winner: Participant) => {
    setCurrentWinner(winner);
    setIsWinnerPopupOpen(true);
    triggerFireworks();
  };

  const triggerFireworks = () => {
    const numParticles = 30 + Math.floor(Math.random() * 20);
    const newParticles: ParticleState[] = [];
    particleIdCounter.current = 0; // Reset counter for new burst

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        hue: Math.random() * 360,
      });
    }
    setParticles(newParticles);
  };

  const removeParticle = (id: number) => {
    setParticles((prevParticles) => prevParticles.filter((p) => p.id !== id));
  };

  const handleCloseWinnerPopup = (removeFromList: boolean) => {
    setIsWinnerPopupOpen(false);
    setParticles([]); // Clear particles

    if (removeFromList && currentWinner && wheelData) {
      const updatedParticipants = wheelData.participants.filter(
        (p) => p.id !== currentWinner.id
      );
      const newWheelData = { ...wheelData, participants: updatedParticipants };
      setWheelData(newWheelData);
      setLocalStorageItem(WHEEL_DATA_KEY, newWheelData);

      if (updatedParticipants.length === 0) {
        alert("All participants have been drawn! Starting a new wheel.");
        handleStartFresh(); // Clears all data and goes to input
        return;
      }
      // If participants remain, go back to display choice to see updated list or re-spin
      setAppStage(AppStage.DisplayAndChoice);
    } else {
      // If not removing, or currentWinner/wheelData is null (shouldn't be if popup was open)
      // Just go back to the display choice screen.
      setAppStage(AppStage.DisplayAndChoice);
    }
    setCurrentWinner(null); // Clear current winner
  };

  return (
    <div className="app-container">
      <h1>Lucky Wheel PWA</h1>

      {/* Initial Data Check Popup */}
      <Popup
        isOpen={isInitialPopupOpen && appStage === AppStage.InitialCheck}
        title="Welcome Back!"
        footerActions={[
          { text: "Start Fresh", onClick: handleStartFresh, variant: "secondary" },
          { text: "Continue", onClick: handleContinueWithExisting, variant: "primary" },
        ]}
      >
        <p>Existing wheel data found. Do you want to continue with it or start fresh?</p>
      </Popup>

      {/* Participant Input Form */}
      {appStage === AppStage.InputCollection && (
        <ParticipantInputForm onParticipantsSet={handleParticipantsSet} />
      )}

      {/* Display Participants and Choose Draw Mode */}
      {appStage === AppStage.DisplayAndChoice &&
        wheelData &&
        wheelData.participants.length > 0 && (
          <div className="display-choice-container">
            <h2>Participants ({wheelData.participants.length}):</h2>
            <ul className="participant-list">
              {wheelData.participants.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
            <p className="choice-prompt">Choose draw mode:</p>
            <div className="draw-mode-buttons">
              <Button
                onClick={chooseIndividualDraw}
                variant="primary"
                disabled={wheelData.participants.length === 0}
              >
                Individual Draw
              </Button>
              <Button
                onClick={chooseGroupDraw}
                variant="primary"
                style={{ marginLeft: "10px" }}
                disabled={wheelData.participants.length === 0}
              >
                Group Draw
              </Button>
            </div>
            <hr className="divider" />
            <Button onClick={resetToInput} variant="secondary">
              Start New Wheel (Clear Data)
            </Button>
          </div>
        )}
      {/* {appStage === AppStage.DisplayAndChoice &&
        (!wheelData || wheelData.participants.length === 0) &&
        // appStage !== AppStage.InputCollection &&
        !isInitialPopupOpen && ( */}
      <div className="display-choice-container">
        <p>No participants loaded. Please start a new wheel.</p>
        <Button onClick={resetToInput} variant="primary">
          Start New Wheel
        </Button>
      </div>
      {/* )} */}

      {/* Individual Draw - Wheel */}
      {appStage === AppStage.IndividualDraw &&
        wheelData &&
        wheelData.participants.length > 0 && (
          <Wheel
            participants={wheelData.participants}
            onSpinComplete={handleSpinComplete}
            onBackToChoice={handleBackToChoice}
          />
        )}
      {appStage === AppStage.IndividualDraw &&
        (!wheelData || wheelData.participants.length === 0) && (
          <div className="wheel-container empty-wheel">
            <p>No participants to spin. Please add participants first.</p>
            <Button onClick={handleBackToChoice} variant="secondary">
              Go Back
            </Button>
          </div>
        )}

      {/* Group Draw Display */}
      {appStage === AppStage.GroupDraw &&
        wheelData &&
        wheelData.participants.length > 0 && (
          <GroupDisplay
            participants={wheelData.participants}
            onGroupsFinalized={handleGroupsFinalized}
            onBackToChoice={handleBackToChoice}
          />
        )}
      {appStage === AppStage.GroupDraw &&
        (!wheelData || wheelData.participants.length === 0) && (
          <div className="group-setup-form">
            <p>No participants for group draw. Please add participants first.</p>
            <Button onClick={handleBackToChoice} variant="secondary">
              Go Back
            </Button>
          </div>
        )}

      {/* Winner Popup with Fireworks */}
      <Popup
        isOpen={isWinnerPopupOpen && currentWinner !== null}
        title="🎉 We Have a Winner! 🎉"
        // onClose={() => handleCloseWinnerPopup(false)} // Optional: allow closing via overlay click
        footerActions={[
          {
            text: "Continue (Remove Winner)",
            onClick: () => handleCloseWinnerPopup(true),
            variant: "danger",
          },
          {
            text: "Continue (Keep Winner)",
            onClick: () => handleCloseWinnerPopup(false),
            variant: "primary",
          },
        ]}
      >
        {currentWinner && (
          <div className="winner-announcement">
            {" "}
            {/* Styled in Popup.scss or App.scss */}
            <p className="winner-name">{currentWinner.name}</p>
            <div className="fireworks-container">
              {" "}
              {/* Styled in Popup.scss or App.scss */}
              {particles.map((p) => (
                <FireworkParticle
                  key={p.id}
                  id={p.id}
                  // x and y are now handled by particle's internal logic relative to its container
                  hue={p.hue}
                  onComplete={removeParticle}
                  x={0}
                  y={0}
                />
              ))}
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}

export default App;
