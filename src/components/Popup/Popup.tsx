// src/components/Popup/Popup.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button/Button";
import "./Popup.scss";

interface PopupProps {
  isOpen: boolean;
  onClose?: () => void; // Optional: if popup can be closed by clicking overlay or an X button
  title?: string;
  children: React.ReactNode;
  footerActions?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  }[];
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close on overlay click if onClose is provided
        >
          <motion.div
            className="popup-content"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
          >
            {title && <h2 className="popup-title">{title}</h2>}
            <div className="popup-body">{children}</div>
            {footerActions && footerActions.length > 0 && (
              <div className="popup-footer">
                {footerActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant || "primary"}
                    className="popup-footer-btn"
                  >
                    {action.text}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
