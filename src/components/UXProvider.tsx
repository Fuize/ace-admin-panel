"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Density = "comfortable" | "compact";
type GlassMode = "balanced" | "clear" | "deep";

const densityOptions = ["comfortable", "compact"] as const;
const glassOptions = ["balanced", "clear", "deep"] as const;
const booleanOptions = ["true", "false"] as const;

type UXContextValue = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  openCommand: () => void;
  closeCommand: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  density: Density;
  setDensity: (density: Density) => void;
  glassMode: GlassMode;
  setGlassMode: (mode: GlassMode) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  chatUnread: number;
  incrementChatUnread: () => void;
  clearChatUnread: () => void;
};

const UXContext = createContext<UXContextValue | null>(null);

function readStorage<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key) as T | null;
  return value && allowed.includes(value) ? value : fallback;
}

export function UXProvider({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [density, setDensityState] = useState<Density>("comfortable");
  const [glassMode, setGlassModeState] = useState<GlassMode>("balanced");
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    setDensityState(readStorage("ace-density", "comfortable", densityOptions));
    setGlassModeState(readStorage("ace-glass", "balanced", glassOptions));
    setReducedMotionState(readStorage("ace-reduced-motion", "false", booleanOptions) === "true");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = density;
    window.localStorage.setItem("ace-density", density);
  }, [density]);

  useEffect(() => {
    document.documentElement.dataset.glass = glassMode;
    window.localStorage.setItem("ace-glass", glassMode);
  }, [glassMode]);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
    window.localStorage.setItem("ace-reduced-motion", reducedMotion ? "true" : "false");
  }, [reducedMotion]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setMobileNavOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setDensity = useCallback((next: Density) => setDensityState(next), []);
  const setGlassMode = useCallback((next: GlassMode) => setGlassModeState(next), []);
  const setReducedMotion = useCallback((next: boolean) => setReducedMotionState(next), []);
  const incrementChatUnread = useCallback(() => setChatUnread((current) => Math.min(current + 1, 99)), []);
  const clearChatUnread = useCallback(() => setChatUnread(0), []);

  const value = useMemo<UXContextValue>(() => ({
    commandOpen,
    setCommandOpen,
    openCommand: () => setCommandOpen(true),
    closeCommand: () => setCommandOpen(false),
    mobileNavOpen,
    setMobileNavOpen,
    density,
    setDensity,
    glassMode,
    setGlassMode,
    reducedMotion,
    setReducedMotion,
    chatUnread,
    incrementChatUnread,
    clearChatUnread,
  }), [chatUnread, clearChatUnread, commandOpen, density, glassMode, incrementChatUnread, mobileNavOpen, reducedMotion, setDensity, setGlassMode, setReducedMotion]);

  return <UXContext.Provider value={value}>{children}</UXContext.Provider>;
}

export function useUX() {
  const context = useContext(UXContext);
  if (!context) throw new Error("useUX must be used inside UXProvider");
  return context;
}
