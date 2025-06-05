// src/types/index.ts

export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string; // e.g., "Group 1"
  participants: Participant[];
}

// Represents the current state of the wheel or draw
export interface WheelData {
  participants: Participant[];
  // Could add more fields later, like current winner, settings, etc.
}
