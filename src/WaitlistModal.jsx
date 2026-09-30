import React, { useEffect, useState } from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export default function WaitlistModal({
  isOpen,
  email,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsFadingOut(false);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isSubmitting) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen && !isFadingOut) return null;

  const handleConfirmClick = async () => {
    if (isSubmitting) return;
    const success = await onConfirm();
    if (success) {
      setIsFadingOut(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
      className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 ${!isFadingOut ? 'animate-modal-overlay' : ''}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onCancel();
        }
      }}
    >
      <div
        className={`w-full max-w-md bg-white rounded-3xl py-14 px-8 sm:py-16 sm:px-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative transition-all duration-300 ${!isFadingOut ? 'animate-modal-pop' : ''}`}
        style={{
          transform: isFadingOut ? 'scale(0.92) translateY(14px)' : undefined,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
        >
          <X size={20} />
        </button>

        {/* Fodd Brand Logo */}
        <img
          src="/assets/FoddLogoTransparentBlack.png"
          alt="Fodd Logo"
          className="h-16 sm:h-20 w-auto object-contain mb-4 select-none pointer-events-none"
        />

        {/* Header Text */}
        <h3
          id="waitlist-modal-title"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2.5 leading-snug"
          style={{ fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif' }}
        >
          Confirm?
        </h3>

        <p className="text-sm sm:text-base text-gray-800 font-medium mb-6 leading-relaxed">
          You are joining the waitlist with this email:
        </p>

        {/* Email Highlight Box */}
        <div
          className="w-full py-4 px-5 rounded-2xl mb-6 flex items-center justify-center gap-2.5 break-all border"
          style={{
            background: '#f8fafc',
            borderColor: '#e2e8f0',
          }}
        >
          <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0" />
          <span className="font-semibold text-gray-900 text-sm sm:text-base select-all">
            {email}
          </span>
        </div>

        {/* Error message if any */}
        {error && (
          <p className="text-red-500 text-xs sm:text-sm mb-4 font-medium">
            {error}
          </p>
        )}

        {/* Action Buttons - Vertical layout with Confirm on top */}
        <div className="flex flex-col gap-4 w-full mt-2">
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="group w-full py-3.5 px-6 rounded-full font-bold text-base text-black bg-white border-2 border-black flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-6px_6px_0_0_#000000] hover:bg-[#f3c555] active:scale-95 active:translate-x-0 active:translate-y-0 active:shadow-none focus:outline-none disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-white cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-black">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              <>
                <Check size={18} strokeWidth={2.5} className="text-black transition-colors" />
                <span>Confirm</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full font-semibold text-sm border-2 border-black/20 hover:border-black text-gray-700 hover:text-black bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
          >
            Change Email
          </button>
        </div>

        {/* Subtext */}
        <p className="text-[12px] text-gray-400 mt-6">
          Protected by anti-spam security. No credit card required.
        </p>
      </div>
    </div>
  );
}


