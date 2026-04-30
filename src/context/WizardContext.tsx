"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WizardState, OnboardingData, PhotoData, QuestionnaireData, JudoData, CompetitionContext, EstimateResult, Sport } from "@/lib/types";

const STORAGE_KEY = "fitness-wizard-state";

const defaultState: WizardState = {
  onboarding: {
    name: "",
    age: null,
    sex: null,
    heightCm: null,
    weightKg: null,
    targetWeight: null,
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
    sport: "none" as Sport,
  },
  judo: {
    sessionsPerWeek: null,
    intensity: null,
    hasCompetitionSoon: false,
    weeklySessionLog: "",
  },
  competitionContext: {
    isActivelyCompeting: false,
    weightClass: null,
    competitionDate: null,
  },
  estimateResult: null,
};

function loadFromStorage(): WizardState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return {
      ...defaultState,
      ...parsed,
      // Never restore base64 blobs — too large and stale after a refresh
      photos: {
        ...(parsed.photos ?? defaultState.photos),
        currentPhotoBase64: null,
        goalPhotoBase64: null,
      },
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: WizardState) {
  try {
    const toSave = {
      ...state,
      // Never persist base64 blobs — too large and stale after a refresh
      photos: { consentGiven: state.photos.consentGiven, currentPhotoBase64: null, goalPhotoBase64: null },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage quota exceeded or private mode — silently ignore
  }
}

interface WizardContextValue {
  state: WizardState;
  hydrated: boolean;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  setPhotos: (data: Partial<PhotoData>) => void;
  setQuestionnaire: (data: Partial<QuestionnaireData>) => void;
  setJudo: (data: Partial<JudoData>) => void;
  setCompetitionContext: (data: Partial<CompetitionContext>) => void;
  setEstimateResult: (result: EstimateResult) => void;
  clearWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(state);
  }, [state, hydrated]);

  const setOnboarding = (data: Partial<OnboardingData>) =>
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...data } }));

  const setPhotos = (data: Partial<PhotoData>) =>
    setState((s) => ({ ...s, photos: { ...s.photos, ...data } }));

  const setQuestionnaire = (data: Partial<QuestionnaireData>) =>
    setState((s) => ({ ...s, questionnaire: { ...s.questionnaire, ...data } }));

  const setJudo = (data: Partial<JudoData>) =>
    setState((s) => ({ ...s, judo: { ...s.judo, ...data } }));

  const setCompetitionContext = (data: Partial<CompetitionContext>) =>
    setState((s) => ({ ...s, competitionContext: { ...s.competitionContext, ...data } }));

  const setEstimateResult = (result: EstimateResult) =>
    setState((s) => ({ ...s, estimateResult: result }));

  const clearWizard = () => {
    setState(defaultState);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <WizardContext.Provider value={{ state, hydrated, setOnboarding, setPhotos, setQuestionnaire, setJudo, setCompetitionContext, setEstimateResult, clearWizard }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
