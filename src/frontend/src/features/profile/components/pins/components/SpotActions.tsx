import React from 'react';

interface SpotActionsProps<T> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  size?: 'sm' | 'md';
}

const SpotActions = <T,>({ item, onEdit, onDelete, size = 'md' }: SpotActionsProps<T>) => {
  const base = size === 'sm' ? 'text-sm px-2.5 py-1' : 'px-2 py-1 text-xs flex-1 justify-center flex';
  return (
    <div className={size === 'sm' ? 'flex gap-2 mt-2' : 'bg-gray-50/50 rounded-md p-2 border border-gray-100'}>
      <div className={size === 'sm' ? '' : 'flex gap-2 items-center justify-center'}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className={`${base} text-blue-700 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded transition-colors items-center gap-1 cursor-pointer flex`}
          title="Edit"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className={`${base} text-red-700 bg-red-50/60 hover:bg-red-100 border border-red-200 rounded transition-colors items-center gap-1 cursor-pointer flex`}
          title="Delete"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default SpotActions;

