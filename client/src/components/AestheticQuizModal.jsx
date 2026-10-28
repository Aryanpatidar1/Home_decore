import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export const AestheticQuizModal = ({ isOpen, onClose, products = [] }) => {
  const [step, setStep] = useState(1);
  const [quizStyle, setQuizStyle] = useState('minimalist');
  const [quizStyleColor, setQuizStyleColor] = useState('#1c1917');
  const [quizStyleFrame, setQuizStyleFrame] = useState('black');
  const [quizRoom, setQuizRoom] = useState('living');
  const [quizColor, setQuizColor] = useState('#064e3b');
  const [profileName, setProfileName] = useState('Modern Sanctuary');
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setProgress(0);
    }
  }, [isOpen]);

  const handleSelectStyle = (style, name, color, frame) => {
    setQuizStyle(style);
    setQuizStyleColor(color);
    setQuizStyleFrame(frame);
    setProfileName(name);
    setStep(2);
  };

  const handleSelectRoom = (room) => {
    setQuizRoom(room);
    setStep(3);
  };

  const handleSelectColor = (color, mood) => {
    setQuizColor(color);
    setProfileName(`${mood} × ${profileName}`);
    setStep(4);

    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStep(5);
        }, 300);
      }
    }, 60);
  };

  const handleRetake = () => {
    setStep(1);
    setProgress(0);
  };

  if (!isOpen) return null;

  const styleIndexMap = { minimalist: 0, bohemian: 1, japandi: 2, luxe: 0 };
  const targetProduct = products[styleIndexMap[quizStyle]] || products[0] || {
    id: '1',
    _id: '1',
    name: 'Custom Canvas Wall Art',
    description: 'AI-generated personalized canvas print with your chosen palette.'
  };

  const roomImgs = {
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    dining: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80'
  };

  const handleGoToCustomize = () => {
    onClose();
    const prodId = targetProduct._id || targetProduct.id;
    navigate(`/products/${prodId}/customize?color=${encodeURIComponent(quizStyleColor)}&frame_style=${quizStyleFrame}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-950 rounded-[2.5rem] border border-stone-200 dark:border-stone-900 shadow-2xl overflow-hidden p-8 md:p-12 animate-in zoom-in-95 duration-200">
        
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                Question 1 of 3
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary">What's your interior style?</h3>
              <p className="text-xs text-stone-400 mt-1">Choose the aesthetic that resonates with your living philosophy.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectStyle('minimalist', 'Minimal Serenity', '#1c1917', 'black')}
                className="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80"
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Minimalist"
                />
                <div className="p-3">
                  <h4 className="font-bold text-primary text-sm">Minimalist</h4>
                  <p className="text-[10px] text-stone-400">Clean lines, silent spaces</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectStyle('bohemian', 'Bohemian Spirit', '#78350f', 'oak')}
                className="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80"
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Bohemian"
                />
                <div className="p-3">
                  <h4 className="font-bold text-primary text-sm">Bohemian</h4>
                  <p className="text-[10px] text-stone-400">Warm, earthy & layered</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectStyle('japandi', 'Japandi Zen', '#a8a29e', 'none')}
                className="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Japandi"
                />
                <div className="p-3">
                  <h4 className="font-bold text-primary text-sm">Japandi</h4>
                  <p className="text-[10px] text-stone-400">Nordic-Japanese harmony</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectStyle('luxe', 'Modern Luxury', '#d4af37', 'gold')}
                className="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                  alt="Modern Luxury"
                />
                <div className="p-3">
                  <h4 className="font-bold text-primary text-sm">Modern Luxury</h4>
                  <p className="text-[10px] text-stone-400">Gold, drama & bespoke</p>
                </div>
              </button>
            </div>
          </div>
        )}

        
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                Question 2 of 3
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary">Your primary room?</h3>
              <p className="text-xs text-stone-400 mt-1">Where will this curated piece make its home?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'living', title: 'Living Room', sub: 'Above sofas & fireplaces' },
                { id: 'bedroom', title: 'Bedroom', sub: 'Sanctuary wall art' },
                { id: 'office', title: 'Study / Office', sub: 'Creative inspiration' },
                { id: 'dining', title: 'Dining Room', sub: 'Elegant gathering space' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoom(r.id)}
                  className="text-left p-5 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all"
                >
                  <h4 className="font-bold text-primary text-sm">{r.title}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{r.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                Question 3 of 3
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary">Color mood?</h3>
              <p className="text-xs text-stone-400 mt-1">Select the palette that best describes your emotional energy.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: '#78350f',
                  name: 'Earth Tones',
                  sub: 'Amber, ochre & terracotta',
                  colors: ['#78350f', '#a16207', '#d97706']
                },
                {
                  id: '#1c1917',
                  name: 'Monochrome',
                  sub: 'Timeless black & white',
                  colors: ['#1c1917', '#78716c', '#e7e5e4']
                },
                {
                  id: '#7c3aed',
                  name: 'Bold & Vibrant',
                  sub: 'Electric & expressive',
                  colors: ['#7c3aed', '#0ea5e9', '#f43f5e']
                },
                {
                  id: '#fef3c7',
                  name: 'Pastels',
                  sub: 'Soft, dreamy & airy',
                  colors: ['#fef3c7', '#fbcfe8', '#a7f3d0']
                }
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelectColor(c.id, c.name)}
                  className="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 transition-all flex items-center gap-4"
                >
                  <div className="flex gap-1 shrink-0">
                    {c.colors.map((hex, i) => (
                      <span key={i} className="w-5 h-5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{c.name}</h4>
                    <p className="text-[10px] text-stone-400">{c.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        
        {step === 4 && (
          <div className="text-center py-10 space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-800 rounded-full">
              <Sparkles className="w-9 h-9 animate-spin text-emerald-700" />
              <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-primary">Running Aura Curation AI...</h4>
              <p className="text-xs text-stone-400">Synthesizing aesthetic profile to match collections...</p>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-emerald-950 h-full transition-all duration-100 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs font-bold text-emerald-950">{progress}% ANALYZED</div>
          </div>
        )}

        
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                Your Aura Profile
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary">{profileName}</h3>
              <p className="text-xs text-stone-400">Based on your choices, here is your bespoke curation recommendation:</p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                <img
                  className="w-20 h-20 rounded-xl object-cover"
                  src={roomImgs[quizRoom] || roomImgs.living}
                  alt="Recommended room view"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h5 className="font-bold text-primary">{targetProduct.name}</h5>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">{targetProduct.description}</p>
                </div>
                <button
                  onClick={handleGoToCustomize}
                  className="bg-emerald-950 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
                >
                  Customize
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleRetake}
                className="text-xs text-stone-400 hover:text-emerald-800 underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Discovery Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
