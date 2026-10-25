import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = ({ onOpenQuiz }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 shadow-[0_10px_40px_-15px_rgba(6,78,59,0.08)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-950 dark:text-emerald-50 hover:opacity-85 transition-opacity flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-950 text-white flex items-center justify-center text-sm font-extrabold shadow-sm">A</span>
            <span>Aura Decor</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-headline-md text-sm tracking-wide">
            <Link
              to="/"
              className={`pb-1 transition-all ${
                isActive('/')
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-900'
                  : 'text-stone-500 hover:text-emerald-800 font-medium'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`pb-1 transition-all ${
                isActive('/products')
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-900'
                  : 'text-stone-500 hover:text-emerald-800 font-medium'
              }`}
            >
              Products
            </Link>
            <Link
              to="/customize"
              className={`pb-1 transition-all ${
                isActive('/customize') || location.pathname.includes('/customize')
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-900'
                  : 'text-stone-500 hover:text-emerald-800 font-medium'
              }`}
            >
              Customize
            </Link>
            <Link
              to="/ai-designer"
              className={`pb-1 transition-all flex items-center gap-1.5 ${
                isActive('/ai-designer')
                  ? 'text-emerald-900 font-bold border-b-2 border-emerald-900'
                  : 'text-stone-500 hover:text-emerald-800 font-medium'
              }`}
            >
              <span>AI Designer</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Cart Icon with Live Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 text-stone-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-full transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[20px] h-5 bg-emerald-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 leading-none shadow-sm animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-emerald-950 hover:bg-stone-100 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-800" />
                  Portfolio
                </Link>
                <button
                  onClick={() => logout(true)}
                  className="px-3.5 py-1.5 text-sm font-semibold text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-stone-600 hover:text-emerald-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-container text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-900 shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-emerald-900 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-72 max-w-full bg-white dark:bg-stone-950 h-full shadow-2xl flex flex-col p-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
              <span className="text-xl font-bold text-emerald-950">Aura Decor</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 py-6 flex-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Products
              </Link>
              <Link
                to="/customize"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Customize Studio
              </Link>
              <Link
                to="/ai-designer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between"
              >
                <span>AI Designer</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between"
              >
                <span>Shopping Cart</span>
                {itemCount > 0 && (
                  <span className="bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl font-semibold text-amber-800 bg-amber-50 border border-amber-200 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl font-semibold text-emerald-900 hover:bg-emerald-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Portfolio & Orders
                  </Link>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-stone-100">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout(true);
                  }}
                  className="w-full py-3 rounded-xl border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center rounded-xl border border-stone-200 font-semibold text-stone-700 text-sm hover:bg-stone-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center rounded-xl bg-emerald-950 text-white font-semibold text-sm hover:bg-emerald-900"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
