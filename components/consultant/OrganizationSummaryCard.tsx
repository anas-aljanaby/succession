import React from 'react';
import { Card } from '../common/Card';

interface OrganizationSummaryCardProps {
    logo?: string;
    name: string;
    candidateCount: number;
    // progressData would be an array of numbers for a sparkline chart
    progressData?: number[];
    onClick: () => void;
}

const OrganizationSummaryCard: React.FC<OrganizationSummaryCardProps> = ({ logo, name, candidateCount, onClick }) => {
    return (
        <Card className="cursor-pointer hover:border-primary-500/50" onClick={onClick}>
            <div className="flex items-center gap-4">
                {logo ? (
                    <img src={logo} alt={`${name} logo`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-primary-400">
                        {name.charAt(0)}
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-white">{name}</h4>
                    <p className="text-sm text-gray-400">{candidateCount} مرشحين</p>
                </div>
            </div>
            <div className="mt-4 h-16 bg-gray-900/50 rounded-md flex items-center justify-center">
                <p className="text-xs text-gray-500">(رسم بياني صغير للتقدم)</p>
            </div>
        </Card>
    );
};

export default OrganizationSummaryCard;
