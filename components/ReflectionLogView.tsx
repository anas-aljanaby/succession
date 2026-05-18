

import React, { useState, useMemo } from 'react';
import type { ReflectionLog, SuccessionJourneyStage, Translations, User, Sentiment, Language } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { summarizeReflections } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { SentimentPositiveIcon } from './icons/SentimentPositiveIcon';
import { SentimentNeutralIcon } from './icons/SentimentNeutralIcon';
import { SentimentNegativeIcon } from './icons/SentimentNegativeIcon';


interface ReflectionLogViewProps {
  stage: SuccessionJourneyStage;
  logs: ReflectionLog[];
  allUsers: User[];
  currentUser: User;
  orgId: number;
  onAddLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
  t: Translations;
  language: Language;
  disabled?: boolean;
}

const SentimentIcon: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
    switch (sentiment) {
        case 'positive': return <SentimentPositiveIcon />;
        case 'neutral': return <SentimentNeutralIcon />;
        case 'negative': return <SentimentNegativeIcon />;
        default: return null;
    }
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- (.*)/g, '\n<li class="ms-6 list-disc">$1</li>')
      .replace(/\n\* (.*)/g, '\n<li class="ms-6 list-disc">$1</li>')
      .replace(/\n/g, '<br />');

    return <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const ReflectionLogView: React.FC<ReflectionLogViewProps> = ({ stage, logs, allUsers, currentUser, orgId, onAddLog, t, language, disabled = false }) => {
  const [newNote, setNewNote] = useState('');
  const [newSentiment, setNewSentiment] = useState<Sentiment>('neutral');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

  const handleAddReflection = () => {
    if (newNote.trim() === '') return;
    onAddLog({
        user_id: currentUser.id,
        org_id: orgId,
        stage_code: stage.code,
        note: newNote,
        sentiment: newSentiment,
    });
    setNewNote('');
    setNewSentiment('neutral');
  };

  const handleSummarize = async () => {
    if (logs.length < 1) return;
    setIsSummarizing(true);
    setSummary(null);
    const notesToSummarize = logs.map(l => l.note);
    const result = await summarizeReflections(notesToSummarize, stage.name, language);
    setSummary(result);
    setIsSummarizing(false);
  };

  return (
    <Card className="bg-gray-800/50">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
         <h4 className="text-md font-semibold text-gray-200">{t.reflectionLog}</h4>
         <Button onClick={handleSummarize} variant="secondary" size="sm" disabled={isSummarizing || logs.length === 0}>
            {isSummarizing ? <Spinner/> : null}
            {isSummarizing ? t.summarizing : t.summarizeReflections}
         </Button>
      </div>

      {isSummarizing && (
          <div className="text-center p-4 text-gray-400">{t.summarizing}...</div>
      )}

      {summary && (
          <Card className="mb-4 bg-gray-900/70 border-primary-500/30">
              <h5 className="text-sm font-bold text-primary-300 mb-2">{t.aiSummary}</h5>
              <MarkdownRenderer content={summary}/>
          </Card>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {logs.length > 0 ? (
            logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                <div key={log.id} className="p-3 bg-gray-900/50 rounded-lg flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1"><SentimentIcon sentiment={log.sentiment} /></div>
                    <div>
                        <p className="text-sm text-gray-200">{log.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            - {userMap.get(log.user_id) || 'Unknown User'} on {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))
        ) : (
            <p className="text-sm text-gray-500 text-center py-4">{t.noReflections}</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <h5 className="text-sm font-medium text-gray-300 mb-2">{t.addReflection}</h5>
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={3}
          className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
          placeholder={t.yourNote}
          disabled={disabled}
        />
        <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{t.sentiment}:</span>
                <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg">
                    <button onClick={() => setNewSentiment('positive')} className={`p-1 rounded ${newSentiment === 'positive' ? 'bg-green-500/30' : ''}`} disabled={disabled}><SentimentPositiveIcon /></button>
                    <button onClick={() => setNewSentiment('neutral')} className={`p-1 rounded ${newSentiment === 'neutral' ? 'bg-yellow-500/30' : ''}`} disabled={disabled}><SentimentNeutralIcon /></button>
                    <button onClick={() => setNewSentiment('negative')} className={`p-1 rounded ${newSentiment === 'negative' ? 'bg-red-500/30' : ''}`} disabled={disabled}><SentimentNegativeIcon /></button>
                </div>
            </div>
            <Button onClick={handleAddReflection} size="sm" disabled={disabled || newNote.trim() === ''}>{t.addNote}</Button>
        </div>
      </div>
    </Card>
  );
};

export default ReflectionLogView;