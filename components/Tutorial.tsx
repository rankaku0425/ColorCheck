import React, { useEffect, useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ steps, isActive, onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Scroll into view when step changes
  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStepIndex];
    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepIndex, isActive, steps]);

  // Track element position continuously to handle scroll/resize updates
  useEffect(() => {
    if (!isActive) return;

    let animationFrameId: number;

    const updateRect = () => {
      const step = steps[currentStepIndex];
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        
        setTargetRect(prev => {
           // Compare to avoid unnecessary re-renders
           if (prev && 
               Math.abs(prev.top - rect.top) < 0.5 && 
               Math.abs(prev.left - rect.left) < 0.5 && 
               Math.abs(prev.width - rect.width) < 0.5 && 
               Math.abs(prev.height - rect.height) < 0.5) {
               return prev;
           }
           return rect;
        });
      }
      animationFrameId = requestAnimationFrame(updateRect);
    };

    animationFrameId = requestAnimationFrame(updateRect);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

  }, [currentStepIndex, isActive, steps]);

  if (!isActive) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Don't render overlay/tooltip until we have a position
  if (!targetRect) return null;

  // Calculate tooltip position
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 60,
    width: '300px',
  };

  // Simple positioning logic
  const isMobile = window.innerWidth < 640;
  const padding = 16;
  
  if (isMobile) {
      // On mobile, just stick it to bottom or top
      if (targetRect.bottom > window.innerHeight / 2) {
          tooltipStyle.bottom = '20px';
          tooltipStyle.left = '50%';
          tooltipStyle.transform = 'translateX(-50%)';
      } else {
          tooltipStyle.top = window.innerHeight / 2 + 'px';
          tooltipStyle.left = '50%';
          tooltipStyle.transform = 'translateX(-50%)';
      }
  } else {
      // Desktop positioning relative to target
      // Default to right, if no space then left, etc.
      if (targetRect.right + 320 < window.innerWidth) {
          tooltipStyle.left = targetRect.right + padding;
          tooltipStyle.top = targetRect.top;
      } else {
          tooltipStyle.left = targetRect.left - 320 - padding;
          tooltipStyle.top = targetRect.top;
      }
      
      // Vertical correction
      if (targetRect.top + 200 > window.innerHeight) {
          tooltipStyle.top = 'auto';
          tooltipStyle.bottom = padding;
      }
      
      // Top overflow correction
      if (parseInt(tooltipStyle.top as string) < 0) {
          tooltipStyle.top = 10;
      }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Highlight Box (Darken surroundings trick) 
          We use a huge box shadow to darken the rest of the screen.
      */}
      <div 
        className="absolute transition-all duration-75 ease-out border-2 border-blue-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
        style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            pointerEvents: 'none' 
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="bg-white p-5 rounded-xl shadow-2xl border border-slate-200 pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800">{currentStep.title}</h3>
            <button 
                onClick={onSkip} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                title="チュートリアルを終了"
            >
                <X size={16} />
            </button>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {currentStep.content}
        </p>
        
        <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">
                {currentStepIndex + 1} / {steps.length}
            </span>
            <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
                {isLastStep ? (
                    <>完了 <Check size={16} /></>
                ) : (
                    <>次へ <ChevronRight size={16} /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;