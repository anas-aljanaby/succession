

import React from 'react';
import type { ValueMirrorData, Translations } from '../types';
import { Card } from './common/Card';

interface ValueMirrorProps {
  data: ValueMirrorData;
  t: Translations;
}

const ValueMirror: React.FC<ValueMirrorProps> = ({ data, t }) => {
  return (
    <Card className="h-full flex flex-col justify-between bg-gradient-to-br from-gray-800 to-gray-900 border-primary-500/30">
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t.valueMirror}</h3>
            <div className="text-center px-4 py-2">
                <span className="text-6xl" role="img" aria-label="feedback emoji">{data.emoji}</span>
                <p className="mt-4 text-xl font-semibold text-white">"{data.quote}"</p>
            </div>
        </div>
      <p className="text-sm text-gray-400 text-center mt-2">{data.feedback}</p>
    </Card>
  );
};

export default ValueMirror;