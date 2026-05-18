import React from 'react';
import type { Candidate } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

interface CandidateCardProps {
  candidate: Candidate;
  onView: () => void;
}

const statusStyles: Record<Candidate['status'], { text: string, bg: string, text_color: string }> = {
    active: { text: 'نشط', bg: 'bg-green-500/10', text_color: 'text-green-400' },
    paused: { text: 'متوقف مؤقتاً', bg: 'bg-yellow-500/10', text_color: 'text-yellow-400' },
    completed: { text: 'مكتمل', bg: 'bg-blue-500/10', text_color: 'text-blue-400' },
    archived: { text: 'مؤرشف', bg: 'bg-gray-500/10', text_color: 'text-gray-400' },
};


export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onView }) => {
    const status = statusStyles[candidate.status];

    return (
        <div 
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
            onClick={onView}
        >
            <img 
                src={candidate.profileImage || `https://ui-avatars.com/api/?name=${candidate.name}&background=374151&color=fff`} 
                alt={candidate.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
            />
            <h3 className="mt-4 font-bold text-lg text-white">{candidate.name}</h3>
            <p className="text-sm text-primary-300 h-10">{candidate.targetPosition}</p>
            
            <div className="w-full mt-4 space-y-3">
                <div className="text-left">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                        <span>التقدم</span>
                        <span className="font-semibold text-white">{candidate.journeyProgress}%</span>
                    </div>
                    <ProgressBar progress={candidate.journeyProgress} />
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${status.bg} ${status.text_color}`}>
                    {status.text}
                </div>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
                آخر نشاط: {new Date(candidate.lastActivityDate).toLocaleDateString()}
            </div>
        </div>
    );
};
