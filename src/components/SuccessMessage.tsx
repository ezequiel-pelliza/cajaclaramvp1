import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full transform animate-pulse">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <p className="text-center text-lg font-semibold text-gray-900">
          {message}
        </p>
      </div>
    </div>
  );
};

export default SuccessMessage;