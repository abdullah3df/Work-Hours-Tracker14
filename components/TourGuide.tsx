import React, { useState, useEffect, useRef } from 'react';

export interface TourStep {
  target: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourGuideProps {
  run: boolean;
  setRun: (run: boolean) => void;
  steps: TourStep[];
  t: (key: string) => string;
}

const TourGuide: React.FC<TourGuideProps> = ({ run, setRun, steps, t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [style, setStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!run) return;

    const targetElement = document.querySelector(steps[currentStep].target);
    if (!targetElement) {
        if(currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
        return;
    };

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    const timer = setTimeout(() => {
        const rect = targetElement.getBoundingClientRect();
        const highlightPadding = 8;
        const newStyle = {
            width: `${rect.width + highlightPadding * 2}px`,
            height: `${rect.height + highlightPadding * 2}px`,
            top: `${rect.top - highlightPadding}px`,
            left: `${rect.left - highlightPadding}px`,
        };
        setStyle(newStyle);

        const tooltip = tooltipRef.current;
        if(tooltip) {
            const ttRect = tooltip.getBoundingClientRect();
            const position = steps[currentStep].position || 'bottom';
            let ttTop = 0, ttLeft = 0;

            switch(position) {
                case 'top':
                    ttTop = rect.top - ttRect.height - highlightPadding - 10;
                    ttLeft = rect.left + rect.width / 2 - ttRect.width / 2;
                    break;
                case 'right':
                    ttTop = rect.top + rect.height / 2 - ttRect.height / 2;
                    ttLeft = rect.right + highlightPadding + 10;
                    break;
                case 'left':
                    ttTop = rect.top + rect.height / 2 - ttRect.height / 2;
                    ttLeft = rect.left - ttRect.width - highlightPadding - 10;
                    break;
                default: // bottom
                    ttTop = rect.bottom + highlightPadding + 10;
                    ttLeft = rect.left + rect.width / 2 - ttRect.width / 2;
            }
            
            ttLeft = Math.max(10, Math.min(ttLeft, window.innerWidth - ttRect.width - 10));
            ttTop = Math.max(10, Math.min(ttTop, window.innerHeight - ttRect.height - 10));

            setTooltipStyle({ top: `${ttTop}px`, left: `${ttLeft}px`, opacity: 1 });
        }

    }, 300);

    return () => clearTimeout(timer);

  }, [currentStep, run, steps]);

  const handleNext = () => {
    setTooltipStyle({ ...tooltipStyle, opacity: 0 });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    setTooltipStyle({ ...tooltipStyle, opacity: 0 });
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setStyle({});
    setTooltipStyle({});
    setRun(false);
    setCurrentStep(0);
  };

  if (!run) return null;

  return (
    <div>
      <div className="tour-overlay" onClick={handleFinish}></div>
      <div className="tour-highlight" style={style}></div>
      <div 
        ref={tooltipRef} 
        className="tour-tooltip" 
        style={tooltipStyle}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm mb-4">{steps[currentStep].content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">{currentStep + 1} / {steps.length}</span>
          <div className="space-x-2 rtl:space-x-reverse">
            {currentStep > 0 && (
              <button onClick={handleBack} className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('back')}</button>
            )}
            <button onClick={handleNext} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
              {currentStep === steps.length - 1 ? t('finish') : t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuide;