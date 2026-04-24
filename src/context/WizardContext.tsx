"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { WizardState, OnboardingData, PhotoData, QuestionnaireData, JudoData } from "@/lib/types";

const defaultState: WizardState = {
  onboarding: {
    name: "",
    age: null,
    sex: null,
    heightCm: null,
    weightKg: null,
    experience: null,
    activityLevel: null,
  },
  photos: {
    consentGiven: false,
    currentPhotoBase64: null,
    goalPhotoBase64: null,
  },
  questionnaire: {
    goalType: null,
    workoutSetting: null,
    injuries: "",
    sport: "none",
  },
  judo: {
    sessionsPerWeek: null,
    intensity: null,
    hasCompetitionSoon: false,
    weeklySessionLog: "",
  },
};

interface WizardContextValue {
  state: WizardState;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  setPhotos: (data: Partial<PhotoData>) => void;
  setQuestionnaire: (data: Partial<QuestionnaireData>) => void;
  setJudo: (data: Partial<JudoData>) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);

  const setOnboarding = (data: Partial<OnboardingData>) =>
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...data } }));

  const setPhotos = (data: Partial<PhotoData>) =>
    setState((s) => ({ ...s, photos: { ...s.photos, ...data } }));

  const setQuestionnaire = (data: Partial<QuestionnaireData>) =>
    setState((s) => ({ ...s, questionnaire: { ...s.questionnaire, ...data } }));

  const setJudo = (data: Partial<JudoData>) =>
    setState((s) => ({ ...s, judo: { ...s.judo, ...data } }));

  return (
    <WizardContext.Provider value={{ state, setOnboarding, setPhotos, setQuestionnaire, setJudo }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
