import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading StaffSync...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-slate-600 font-medium text-sm tracking-wide">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
      <p className="text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

