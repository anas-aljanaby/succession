
import React, { useState, useEffect } from 'react';
import type { Survey, SurveyAnswer, SurveyQuestion, SurveyResult, Translations } from '../types';
import { Button } from './common/Button';
import { XMarkIcon } from './icons/XMarkIcon';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
  t: Translations;
  onSubmit: (result: Omit<SurveyResult, 'submittedBy'>) => void;
  stageCode: string | null;
  stageName?: string;
  title?: string;
  description?: string;
}

const RatingInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    return (
        <div className="flex items-center justify-center gap-2 md:gap-3">
            {[1, 2, 3, 4, 5].map(rating => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full text-lg font-bold transition-all duration-200 flex items-center justify-center border-2
                        ${value >= rating ? 'bg-primary-500 text-white scale-110 border-primary-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'}
                    `}
                    aria-label={`Rating ${rating}`}
                    aria-pressed={value === rating}
                >
                    {rating}
                </button>
            ))}
        </div>
    );
};

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, survey, t, onSubmit, stageCode, stageName, title, description }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, SurveyAnswer>>(new Map());
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Reset state when modal opens
        setCurrentSectionIndex(0);
        setAnswers(new Map());
        setIsFinishing(false);
    }
  }, [isOpen]);

  if (!isOpen || !stageCode) return null;
  
  const currentSection = survey.sections[currentSectionIndex];

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => new Map(prev).set(questionId, { questionId, value }));
  };
  
  const handleNext = () => {
      if(currentSectionIndex < survey.sections.length - 1) {
          setCurrentSectionIndex(prev => prev + 1);
      }
  };

  const handlePrev = () => {
      if(currentSectionIndex > 0) {
          setCurrentSectionIndex(prev => prev - 1);
      }
  };

  const handleSubmit = () => {
    setIsFinishing(true);
    const result: Omit<SurveyResult, 'submittedBy'> = {
        surveyId: survey.id,
        stageCode,
        submittedAt: new Date().toISOString(),
        answers: Array.from(answers.values()),
    };
    onSubmit(result);
  };
  
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="survey-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <header className="flex justify-between items-center p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 id="survey-title" className="text-xl md:text-2xl font-bold text-white">{title || survey.name}</h2>
            <p className="text-sm text-primary-400">{t.evaluationForStage.replace('{stageName}', stageName || '')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close survey">
            <XMarkIcon />
          </button>
        </header>

        {/* Progress Bar */}
        <div className="p-4 md:p-6 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
                {survey.sections.map((section, index) => (
                    <div key={section.title} className="flex-1 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${index <= currentSectionIndex ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                           {index + 1}
                        </div>
                        <span className={`text-xs md:text-sm hidden sm:inline ${index === currentSectionIndex ? 'font-semibold text-white' : 'text-gray-400'}`}>{section.title}</span>
                         {index < survey.sections.length - 1 && <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${index < currentSectionIndex ? 'bg-primary-500' : 'bg-gray-700'}`}></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
            {description && (
                <p className="text-gray-300 text-center -mt-2 mb-4">{description}</p>
            )}
            <h3 className="text-2xl font-semibold text-primary-300 text-center mb-6">{currentSection.title}</h3>
            {currentSection.questions.map(q => (
                <div key={q.id} className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-gray-200 mb-4 text-center">{q.text}</p>
                    {q.type === 'rating' && (
                       <RatingInput 
                         value={answers.get(q.id)?.value as number || 0}
                         onChange={(val) => handleAnswerChange(q.id, val)}
                       />
                    )}
                    {q.type === 'text' && (
                        <textarea
                            rows={4}
                            value={answers.get(q.id)?.value as string || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    )}
                </div>
            ))}
        </main>

        {/* Footer */}
        <footer className="p-4 md:p-6 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <Button variant="secondary" onClick={handlePrev} disabled={currentSectionIndex === 0}>{t.previous}</Button>
            {currentSectionIndex < survey.sections.length - 1 ? (
                <Button onClick={handleNext}>{t.next}</Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isFinishing}>{t.finishEvaluation}</Button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default SurveyModal;