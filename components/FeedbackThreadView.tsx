import React, { useMemo, useState } from 'react';
import type { FeedbackThread, Translations, User, UserRole, SuccessionPlan, FeedbackMessage } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { LinkIcon } from './icons/LinkIcon';

interface FeedbackThreadViewProps {
  thread?: FeedbackThread;
  plan: SuccessionPlan;
  currentUser: User;
  activeRole: UserRole | null;
  allUsers: User[];
  t: Translations;
  onAddMessage: (message: Omit<FeedbackMessage, 'id'>) => void;
  onUpdateStatus: (status: 'AwaitingReply' | 'Discussed') => void;
}

const FeedbackThreadView: React.FC<FeedbackThreadViewProps> = (props) => {
  const { thread, plan, currentUser, activeRole, allUsers, t, onAddMessage, onUpdateStatus } = props;
  const [replyText, setReplyText] = useState('');
  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

  const canManage = useMemo(() => ['Consulting_House_Admin', 'Organization_Admin'].includes(activeRole || ''), [activeRole]);
  const isCandidate = useMemo(() => activeRole === 'Leadership_Candidate', [activeRole]);

  const lastMessage = thread?.messages[thread.messages.length - 1];
  const canCandidateReply = useMemo(() => {
    return isCandidate && lastMessage && lastMessage.senderId !== currentUser.id;
  }, [isCandidate, lastMessage, currentUser.id]);

  const handleSendReply = () => {
    if (!replyText.trim() || !activeRole) return;
    const message: Omit<FeedbackMessage, 'id'> = {
        senderId: currentUser.id,
        senderRole: activeRole,
        text: replyText,
        timestamp: new Date().toISOString(),
    };
    onAddMessage(message);
    setReplyText('');
  };

  const handleExport = () => {
      alert(t.exportToPdf + ' is a future feature.');
  };

  if (!thread) {
    return (
        <Card className="bg-gray-800/50 flex flex-col items-center justify-center min-h-[200px]">
             <h4 className="text-md font-semibold text-gray-200">{t.candidateFeedbackThread}</h4>
             <p className="text-sm text-gray-500 mt-2">{t.noFeedbackForStage}</p>
        </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
         <h4 className="text-md font-semibold text-gray-200">{t.candidateFeedbackThread}</h4>
         {canManage && (
             <Button onClick={handleExport} variant="secondary" size="sm">{t.exportToPdf}</Button>
         )}
      </div>

      <div className="flex-grow space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
        {thread.messages.map(msg => {
            const isOwnMessage = msg.senderId === currentUser.id;
            return (
                 <div key={msg.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg max-w-sm ${isOwnMessage ? 'bg-primary-700' : 'bg-gray-700'}`}>
                        <p className="text-sm text-gray-200">{msg.text}</p>
                        {msg.attachment && (
                            <a href={msg.attachment.value} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-xs bg-black/20 p-1.5 rounded-md hover:bg-black/40">
                                {msg.attachment.type === 'file' ? <PaperClipIcon/> : <LinkIcon/>}
                                <span className="truncate text-cyan-400">{msg.attachment.name || msg.attachment.value}</span>
                            </a>
                        )}
                    </div>
                     <p className="text-xs text-gray-500 mt-1 px-1">
                        {t.from} {userMap.get(msg.senderId) || 'Unknown'} - {new Date(msg.timestamp).toLocaleDateString()}
                    </p>
                </div>
            )
        })}
      </div>
      
      {canCandidateReply && (
          <div className="mt-auto pt-4 border-t border-gray-700">
             <h5 className="text-sm font-medium text-gray-300 mb-2">{t.candidateReply}</h5>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={3}
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={t.addYourReply}
                />
                <div className="flex justify-end mt-2">
                    <Button onClick={handleSendReply} size="sm" disabled={!replyText.trim()}>{t.sendReply}</Button>
                </div>
          </div>
      )}
      
       {canManage && (
          <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center">
             <div className="text-sm">
                <span className="text-gray-400">{t.feedbackStatus}: </span>
                <span className={`font-semibold ${thread.status === 'Discussed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {t[`status_${thread.status}`]}
                </span>
             </div>
             <Button onClick={() => onUpdateStatus('Discussed')} size="sm" disabled={thread.status === 'Discussed'}>{t.markAsDiscussed}</Button>
          </div>
      )}
    </Card>
  );
};

export default FeedbackThreadView;
