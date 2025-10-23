import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative h-16 w-16">
      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
      <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 dark:border-purple-400 animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;