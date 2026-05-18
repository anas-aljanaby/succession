
import React, { useState, useEffect } from 'react';

interface DonutChartProps {
    data: { label: string; value: number }[];
    size?: number;
}

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 200 }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const radius = size / 2 - 20;
    const circumference = 2 * Math.PI * radius;
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsAnimated(true), 100);
      return () => clearTimeout(timer);
    }, []);

    let accumulatedPercentage = 0;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
                        {data.map((item, index) => {
                            const percentage = (item.value / total);
                            const dasharrayValue = percentage * circumference;
                            const rotation = accumulatedPercentage * 360;

                            const segment = (
                                <circle
                                    key={index}
                                    r={radius}
                                    cx="0"
                                    cy="0"
                                    fill="transparent"
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth="20"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={isAnimated ? circumference - dasharrayValue : circumference}
                                    transform={`rotate(${rotation})`}
                                    style={{ transition: `stroke-dashoffset 1s ease-out ${index * 0.1}s` }}
                                    strokeLinecap="butt"
                                />
                            );

                            accumulatedPercentage += percentage;
                            return segment;
                        })}
                    </g>
                </svg>
            </div>
            <div className="space-y-2">
                {data.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-semibold text-white">({item.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;