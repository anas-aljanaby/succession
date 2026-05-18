import React from 'react';
import type { Translations } from '../types';
import { RadialProgress } from './common/RadialProgress';

interface DualGaugeProps {
  readiness: { value: number; label: string };
  maturity: { value: number; label: string };
  t: Translations;
}

const DualGauge: React.FC<DualGaugeProps> = ({ readiness, maturity, t }) => {
  return (
    <div className="flex justify-around items-center gap-4 p-4">
      <div className="tooltip-container">
        <RadialProgress
          value={readiness.value}
          label={readiness.label}
          color="stroke-primary-400"
          size={140}
        />
        <span className="tooltip-text">{t.tooltip_lri}</span>
      </div>
      <div className="tooltip-container">
        <RadialProgress
          value={maturity.value}
          label={maturity.label}
          color="stroke-teal-400"
          size={140}
        />
        <span className="tooltip-text">{t.tooltip_maturity}</span>
      </div>
    </div>
  );
};

export default DualGauge;