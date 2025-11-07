'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: '💰',
    title: 'Farmer des jetons',
    description: 'Gagne des jetons gratuitement via les missions quotidiennes ou le tap-to-earn. Plus tu joues, plus tu accumules de jetons !',
  },
  {
    icon: '⚽️',
    title: 'Miser sur des matchs',
    description: 'Utilise tes jetons pour parier sur des matchs de football fictifs. Choisis ton équipe favorite et mise sur la victoire !',
  },
  {
    icon: '💎',
    title: 'Gagner des diamants',
    description: 'Si ton pari est gagnant, tu remportes des diamants selon les cotes du match. Plus le risque est élevé, plus la récompense est grande !',
  },
  {
    icon: '🏆',
    title: 'Grimper au classement',
    description: 'Accumule des diamants pour monter dans le classement mondial. Défie tes amis et deviens le meilleur parieur !',
  },
  {
    icon: '💸',
    title: 'Bientôt : EasyBetcoin',
    description: 'Dans le futur, tu pourras échanger tes diamants contre la cryptomonnaie EasyBetcoin. Reste connecté pour ne rien manquer !',
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function TutorialModal({ isOpen, onComplete }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-[#30363D] rounded-2xl p-6 shadow-2xl"
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                    : index < currentStep
                    ? 'w-4 bg-green-500'
                    : 'w-4 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative h-80 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="text-7xl mb-6">{step.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-4">{step.title}</h2>
              <p className="text-white/70 text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-8 gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="text-white/50 text-sm font-medium">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
          >
            <span>{isLastStep ? 'Commencer' : 'Suivant'}</span>
            {!isLastStep && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
