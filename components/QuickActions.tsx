import React from 'react';
import { QuickAction } from '../types';
import { QUICK_ACTIONS } from '../constants';

interface QuickActionsProps {
  onActionClick: (query: string) => void;
  disabled: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, disabled }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full px-4">
      {QUICK_ACTIONS.map((action: QuickAction, index) => (
        <button
          key={index}
          onClick={() => onActionClick(action.query)}
          disabled={disabled}
          className="whitespace-nowrap px-4 py-2 bg-white border border-[#D7CCC8] text-[#8B5E3C] rounded-full text-sm font-medium hover:bg-stone-50 hover:border-[#8B5E3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;