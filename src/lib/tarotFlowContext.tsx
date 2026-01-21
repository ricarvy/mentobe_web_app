'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Spread, TarotCard } from '@/lib/tarot';

export interface TarotFlowState {
  selectedSpread: Spread | null;
  question: string;
  drawnCards: TarotCard[];
  isDrawing: boolean;
  showResult: boolean;
  aiInterpretation: string;
  showAiInterpretation: boolean;
  isGenerating: boolean;
}

interface TarotFlowContextType {
  state: TarotFlowState;
  setSelectedSpread: (spread: Spread | null) => void;
  setQuestion: (question: string | ((prev: string) => string)) => void;
  setDrawnCards: (cards: TarotCard[]) => void;
  setIsDrawing: (drawing: boolean) => void;
  setShowResult: (show: boolean) => void;
  setAiInterpretation: (text: string | ((prev: string) => string)) => void;
  setShowAiInterpretation: (show: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  resetFlow: () => void;
  isInFlow: boolean;
}

const TarotFlowContext = createContext<TarotFlowContextType | undefined>(undefined);

export function TarotFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TarotFlowState>({
    selectedSpread: null,
    question: '',
    drawnCards: [],
    isDrawing: false,
    showResult: false,
    aiInterpretation: '',
    showAiInterpretation: false,
    isGenerating: false,
  });

  const setSelectedSpread = (spread: Spread | null) => {
    setState(prev => ({ ...prev, selectedSpread: spread }));
  };

  const setQuestion = (question: string | ((prev: string) => string)) => {
    setState(prev => ({
      ...prev,
      question: typeof question === 'function' ? question(prev.question) : question,
    }));
  };

  const setDrawnCards = (cards: TarotCard[]) => {
    setState(prev => ({ ...prev, drawnCards: cards }));
  };

  const setIsDrawing = (drawing: boolean) => {
    setState(prev => ({ ...prev, isDrawing: drawing }));
  };

  const setShowResult = (show: boolean) => {
    setState(prev => ({ ...prev, showResult: show }));
  };

  const setAiInterpretation = (text: string | ((prev: string) => string)) => {
    setState(prev => ({
      ...prev,
      aiInterpretation: typeof text === 'function' ? text(prev.aiInterpretation) : text,
    }));
  };

  const setShowAiInterpretation = (show: boolean) => {
    setState(prev => ({ ...prev, showAiInterpretation: show }));
  };

  const setIsGenerating = (generating: boolean) => {
    setState(prev => ({ ...prev, isGenerating: generating }));
  };

  const resetFlow = () => {
    setState({
      selectedSpread: null,
      question: '',
      drawnCards: [],
      isDrawing: false,
      showResult: false,
      aiInterpretation: '',
      showAiInterpretation: false,
      isGenerating: false,
    });
  };

  const isInFlow = !!state.selectedSpread;

  return (
    <TarotFlowContext.Provider
      value={{
        state,
        setSelectedSpread,
        setQuestion,
        setDrawnCards,
        setIsDrawing,
        setShowResult,
        setAiInterpretation,
        setShowAiInterpretation,
        setIsGenerating,
        resetFlow,
        isInFlow,
      }}
    >
      {children}
    </TarotFlowContext.Provider>
  );
}

export function useTarotFlow() {
  const context = useContext(TarotFlowContext);
  if (context === undefined) {
    throw new Error('useTarotFlow must be used within a TarotFlowProvider');
  }
  return context;
}
