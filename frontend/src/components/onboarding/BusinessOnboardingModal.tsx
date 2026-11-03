"use client";

import React from "react";
import { AIConversationalOnboarding } from "./AIConversationalOnboarding";
import { BusinessProfile } from "@/types";

interface BusinessOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: BusinessProfile) => void;
}

export const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  return (
    <AIConversationalOnboarding
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
    />
  );
};
