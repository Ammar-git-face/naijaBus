'use client';

const steps = ['Route', 'Bus', 'Seat', 'Details', 'Summary'];

export default function Stepper({ currentStep }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center gap-1">
            {/* Circle */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${isActive || isCompleted ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {stepNum}
            </div>
            {/* Label */}
            <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {step}
            </span>
            {/* Arrow */}
            {index < steps.length - 1 && (
              <span className="text-gray-300 text-sm mx-1">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
