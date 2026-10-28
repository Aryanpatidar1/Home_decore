import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Mail, Share2, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Footer = ({ onOpenQuiz }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    addToast('Thank you for subscribing to Aura Decor newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="w-full pt-20 pb-10 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-950 text-white flex items-center justify-center text-xs font-bold">A</span>
              <span>Aura Decor</span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-body-md text-sm mb-6 leading-relaxed">
              Defining the art of personalized luxury for the modern home. Impeccable craft, innovative spatial technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-stone-200/60 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:hello@auradecor.com" className="w-9 h-9 rounded-full bg-stone-200/60 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-200/60 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors" aria-label="Social">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          
          <div>
            <h4 className="font-headline-md text-xs font-bold text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Collections</h4>
            <ul className="space-y-3.5 text-sm font-medium text-stone-500">
              <li><Link to="/products?category=Wall+Decor" className="hover:text-emerald-800 transition-colors">Wall Gallery Art</Link></li>
              <li><Link to="/products?category=Lighting" className="hover:text-emerald-800 transition-colors">Lighting Sculptures</Link></li>
              <li><Link to="/products?category=Soft+Furnishings" className="hover:text-emerald-800 transition-colors">Soft Goods & Linen</Link></li>
              <li><Link to="/products?category=Rugs+%26+Mats" className="hover:text-emerald-800 transition-colors">Rugs & Woven Mats</Link></li>
              <li><Link to="/products?category=Decorative+Accents" className="hover:text-emerald-800 transition-colors">Decorative Stoneware</Link></li>
            </ul>
          </div>

          
          <div>
            <h4 className="font-headline-md text-xs font-bold text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Experience</h4>
            <ul className="space-y-3.5 text-sm font-medium text-stone-500">
              <li><Link to="/customize" className="hover:text-emerald-800 transition-colors">Spatial Visualizer</Link></li>
              <li>
                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="hover:text-emerald-800 transition-colors text-left"
                >
                  AI Curation Quiz
                </button>
              </li>
              <li><Link to="/ai-designer" className="hover:text-emerald-800 transition-colors">AI Room Designer</Link></li>
              <li><Link to="/products" className="hover:text-emerald-800 transition-colors">Bespoke Design Service</Link></li>
            </ul>
          </div>

          
          <div>
            <h4 className="font-headline-md text-xs font-bold text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Newsletter</h4>
            <p className="text-stone-500 mb-4 text-sm leading-relaxed">
              Join our inner circle for exclusive spatial design previews and styling advice.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="bg-white border border-stone-200 px-4 py-3 rounded-l-xl w-full text-xs focus:outline-none focus:border-emerald-800"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-950 text-white px-5 py-3 rounded-r-xl hover:bg-emerald-900 transition-colors flex items-center justify-center shrink-0"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-400">
          <div>© {new Date().getFullYear()} Aura Decor. The Art of Living Well. Handcrafted with luxury standards.</div>
          <div className="flex flex-wrap justify-center gap-6 font-semibold uppercase tracking-wider text-[11px]">
            <a href="#" className="hover:text-emerald-800 transition-colors">Sustainability</a>
            <a href="#" className="hover:text-emerald-800 transition-colors">Shipping & Returns</a>
            <a href="#" className="hover:text-emerald-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-800 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
