import React, { useState } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';

export const RazorpayModal = ({ isOpen, onClose, amount, onConfirm, isProcessing, demoMode = false }) => {
  const [upiId, setUpiId] = useState('demo@razorpay');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Razorpay Header */}
        <div className="bg-[#2d72d9] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 3L4 14.5H9.5L8 21L20 9.5H14L17.5 3H7.5Z" fill="white" />
            </svg>
            <div>
              <p className="font-bold text-sm">{demoMode ? 'Demo Checkout' : 'Razorpay'}</p>
              <p className="text-white/80 text-[10px]">
                {demoMode ? 'No real payment will be processed' : 'Aura Decor · Secure Gateway'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Amount Due</p>
            <p className="text-3xl font-extrabold text-stone-900 mt-1">
              ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#2d72d9]/10 border border-[#2d72d9]/30 px-4 py-2.5 rounded-xl">
            <span className="text-xs font-bold text-[#2d72d9] uppercase tracking-widest">
              {demoMode ? 'DEMO PAYMENT · NO CHARGE' : 'Instant UPI / Card Payment'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                {demoMode ? 'Demo payment reference' : 'Virtual Payment Address (VPA)'}
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder={demoMode ? 'Demo checkout' : 'name@upi'}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2d72d9] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
              <span>{demoMode ? 'Payment mode:' : 'Supported:'}</span>
              <span className="font-bold text-stone-600">
                {demoMode ? 'Preview only · no payment taken' : 'GPay · PhonePe · Paytm · NetBanking'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onConfirm(upiId)}
            disabled={isProcessing}
            className="w-full bg-[#2d72d9] text-white py-4 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            {isProcessing ? (
              <span className="animate-spin text-sm">Processing Payment...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{demoMode ? 'Place Demo Order' : 'Pay Now & Confirm Order'}</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-stone-400 flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {demoMode ? 'This demo checkout does not collect or charge payment.' : '256-bit SSL encrypted & verified by Razorpay'}
          </p>
        </div>
      </div>
    </div>
  );
};
