import React, { useState } from 'react';

interface Nudge {
  id: string;
  message: string;
  type: string;
  field?: string;
}

interface Props {
  nudges: Nudge[];
  onApply: (id: string, value: string) => void;
}

export const NudgePanel: React.FC<Props> = ({ nudges, onApply }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-950 rounded-2xl p-5">
      <div className="font-semibold mb-3 text-blue-700 dark:text-blue-300">Inline Nudges</div>
      {nudges.map(n => (
        <div key={n.id} className="flex items-center gap-3 mb-2 text-sm">
          <div className="flex-1">{n.message}</div>
          {n.field && (
            <>
              <input 
                className="border px-2 py-1 rounded text-sm w-52" 
                placeholder={`Enter ${n.field}`} 
                value={values[n.id] || ''} 
                onChange={e => setValues(v => ({...v, [n.id]: e.target.value}))} 
              />
              <button onClick={() => onApply(n.id, values[n.id] || '')} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Apply</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
