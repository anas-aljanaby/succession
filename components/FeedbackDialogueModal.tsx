import React, { useState, useMemo } from 'react';
import type { Translations, SuccessionPlan, SuccessionJourneyStage, User, FeedbackMessage, FeedbackAttachment, DevelopmentRecommendation, Priority, Language } from '../types';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { LinkIcon } from './icons/LinkIcon';
import { improvementAreas } from '../constants';
import { Select } from './common/Select';
import { TrashIcon } from './icons/TrashIcon';

interface FeedbackDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: SuccessionJourneyStage;
  plan: SuccessionPlan;
  currentUser: User;
  t: Translations;
  language: Language;
  onSend: (message: Omit<FeedbackMessage, 'id'>, recommendations: Omit<DevelopmentRecommendation, 'id'>[]) => void;
}

const FeedbackDialogueModal: React.FC<FeedbackDialogueModalProps> = (props) => {
  const { isOpen, onClose, stage, plan, currentUser, t, language, onSend } = props;
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<FeedbackAttachment | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [recommendations, setRecommendations] = useState<Omit<DevelopmentRecommendation, 'id'>[]>([]);

  const improvementAreaOptions = useMemo(() => {
      const langKey = language === 'ar' ? 'name_ar' : 'name_en';
      return improvementAreas.map(area => ({ value: area.key, label: area[langKey] }));
  }, [language]);

  const handleAddRecommendation = () => {
      setRecommendations(prev => [...prev, {
          stageCode: stage.code,
          consultantId: currentUser.id,
          improvementArea: improvementAreaOptions[0].value,
          recommendationText: '',
          priority: 'Medium',
          timestamp: new Date().toISOString(),
      }]);
  };

  const handleUpdateRecommendation = <K extends keyof Omit<DevelopmentRecommendation, 'id'>>(index: number, key: K, value: Omit<DevelopmentRecommendation, 'id'>[K]) => {
      setRecommendations(prev => prev.map((rec, i) => i === index ? { ...rec, [key]: value } : rec));
  };
  
  const handleRemoveRecommendation = (index: number) => {
      setRecommendations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (text.trim() === '' || !currentUser.roles[0]) return;
    const message: Omit<FeedbackMessage, 'id'> = {
        senderId: currentUser.id,
        senderRole: currentUser.roles.find(r => r === 'Consulting_House_Admin' || r === 'Organization_Admin') || currentUser.roles[0],
        text,
        attachment: attachment || undefined,
        timestamp: new Date().toISOString(),
    };
    onSend(message, recommendations);
    // Reset state
    setText('');
    setAttachment(null);
    setLinkInput('');
    setRecommendations([]);
  };

  const title = t.feedbackModalTitle.replace('{candidateName}', plan.candidate.name);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 text-gray-300">
        <p className="text-sm">
            <span className="font-semibold">{t.stage}:</span> {stage.name}
        </p>

        <div>
          <label htmlFor="consultant-notes" className="block text-sm font-medium mb-1">
            {t.consultantNotes}
          </label>
          <textarea
            id="consultant-notes"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        {/* Development Recommendations Section */}
        <div className="space-y-4 pt-4 border-t border-gray-700">
            <h4 className="text-md font-semibold text-white">{t.suggestedImprovementPoints}</h4>
            {recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-gray-900/50 rounded-lg space-y-3 relative">
                    <Button onClick={() => handleRemoveRecommendation(index)} variant="secondary" size="sm" className="!p-1.5 absolute top-2 right-2 rtl:right-auto rtl:left-2">
                        <TrashIcon />
                    </Button>
                    <div>
                        <label className="text-xs font-medium text-gray-400">{t.improvementArea}</label>
                        <Select 
                            options={improvementAreaOptions}
                            value={rec.improvementArea}
                            onChange={(e) => handleUpdateRecommendation(index, 'improvementArea', e.target.value)}
                            className="!py-1.5 !text-sm mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400">{t.recommendationText}</label>
                        <textarea 
                           rows={2}
                           value={rec.recommendationText}
                           onChange={(e) => handleUpdateRecommendation(index, 'recommendationText', e.target.value)}
                           className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 block mb-1">{t.priority}</label>
                        <div className="flex gap-2">
                            {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                                <Button 
                                    key={p}
                                    type="button"
                                    onClick={() => handleUpdateRecommendation(index, 'priority', p)}
                                    variant={rec.priority === p ? 'primary' : 'secondary'}
                                    size="sm"
                                    className={rec.priority === p ? '' : 'bg-gray-800'}
                                >
                                    {t[`priority_${p}`]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
             <Button onClick={handleAddRecommendation} variant="secondary" size="sm">{t.addRecommendation}</Button>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>{t.cancel}</Button>
          <Button onClick={handleSend} disabled={text.trim() === ''}>{t.sendFeedback}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackDialogueModal;