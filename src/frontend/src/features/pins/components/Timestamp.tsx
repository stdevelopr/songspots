import React from 'react';

interface TimestampRowProps {
  date?: Date;
}

export const TimestampRow: React.FC<TimestampRowProps> = ({ date }) => {
  if (!date) return null;
  return (
    <div className="mt-6 pt-4 border-t border-white/10">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Memory created</span>
        <span className="font-medium text-gray-700">
          {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

interface TimestampBadgeProps {
  date?: Date;
}

export const TimestampBadge: React.FC<TimestampBadgeProps> = ({ date }) => {
  if (!date) return null;
  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="text-center">
        <span className="text-xs font-medium text-gray-600 bg-white/20 px-3 py-1 rounded-full">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

