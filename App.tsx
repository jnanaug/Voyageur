
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import TripPlanner from './components/TripPlanner';
import DiningConcierge from './components/DiningConcierge';
import Auth from './components/Auth';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import Blog from './components/Blog';
import Rewards from './components/Rewards';
import Wallet from './components/Wallet';
import Support from './components/Support';
import TravelDNA from './components/TravelDNA';
import Community from './components/Community';
import Marketplace from './components/Marketplace';
import Achievements from './components/Achievements';
import Sustainability from './components/Sustainability';
import Integrations from './components/Integrations';
import Referral from './components/Referral';
import { AppView, UserProfile } from './types';
import { supabase } from './services/supabaseClient'; // Import supabase client
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  console.log("🚀 VOYAGEUR VERSION: 1.1.0 - BUILD FIXES APPLIED");
  const [currentView, setView] = useState<AppView>(AppView.LANDING);
  const [history, setHistory] = useState<AppView[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [planningPrompt, setPlanningPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const [authError, setAuthError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle URL Error Params (Global)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'no_account') {
      // Set error state to pass to Auth component
      setAuthError("Account does not exist. Please Sign Up first.");
      // Force view to AUTH
      setView(AppView.AUTH);
      // Clean URL immediately so it doesn't persist on refresh/navigation
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Clear auth error when switching views
  useEffect(() => {
    if (currentView !== AppView.AUTH) {
      setAuthError(null);
    }
  }, [currentView]);

  // Listen for Supabase Session Changes
  useEffect(() => {
    if (supabase) {
      let mounted = true;

      // Listen for changes (sign in, sign out, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;

        console.log("🔍 [App.tsx] Auth Change:", _event);
        if (session?.user) {
          console.log("👤 [App.tsx] User Metadata:", session.user.user_metadata);
        }

        if (session?.user) {
          localStorage.removeItem('auth_intent');

          setUser((prev) => {
            const newName = session.user.user_metadata.full_name || prev?.fullName || "Traveler";
            console.log("👤 [App.tsx] Setting User State. New Name:", newName, "Session Name:", session.user.user_metadata.full_name, "Prev Name:", prev?.fullName);
            return {
              id: session.user.id,
              fullName: newName,
              email: session.user.email!,
              createdAt: new Date(session.user.created_at).getTime()
            };
          });

          // FIX: If name is "Traveler", it might be a stale session. Force refresh.
          if (!session.user.user_metadata.full_name && (!user || user.fullName === "Traveler")) {
            console.log("🔄 [App.tsx] Name missing. Forcing session refresh...");
            supabase.auth.refreshSession();
          }

          // Auto-redirect to dashboard on login
          if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN') {
            setView((prev) => (prev === AppView.LANDING || prev === AppView.AUTH) ? AppView.DASHBOARD : prev);
          }
        } else {
          setUser(null);
          // Only redirect to landing if we are on a protected route
          setView((prev) => {
            const protectedViews = [
              AppView.DASHBOARD, AppView.PLANNER, AppView.DINING,
              AppView.REWARDS, AppView.WALLET, AppView.TRAVEL_DNA,
              AppView.ACHIEVEMENTS, AppView.SUSTAINABILITY
            ];
            return protectedViews.includes(prev) ? AppView.LANDING : prev;
          });
        }
        setIsLoading(false);
      });

      // Check for existing session on load (only to handle "no session" case quickly)
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session check error:", error);
          supabase.auth.signOut();
        }
        // If NO session, stop loading. If session exists, onAuthStateChange handles it.
        if (!session) {
          setIsLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []); // Remove dependencies to prevent re-subscriptions

  const handleSetView = (view: AppView) => {
    setHistory((prev) => [...prev, currentView]);
    setView(view);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevView = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setView(prevView);
    } else {
      setView(AppView.LANDING);
    }
  };

  // Views where the back button should remain hidden (Main Pillars)
  const hideBackButton = [
    AppView.LANDING,
    AppView.DASHBOARD,
    AppView.PLANNER,
    AppView.DINING,
    AppView.AUTH
  ].includes(currentView);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-1 h-12">
          <div className="w-1 bg-cyan-400/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
          <div className="w-1 bg-cyan-300/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '100ms' }} />
          <div className="w-1 bg-white/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
          <div className="w-1 bg-cyan-300/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
          <div className="w-1 bg-cyan-400/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-blue-500/30 flex flex-col">


      <Navigation
        currentView={currentView}
        setView={handleSetView}
        isLoggedIn={isLoggedIn}
        user={user}
        setIsLoggedIn={(val) => {
          if (!val) {
            setUser(null);
            if (supabase) supabase.auth.signOut();
          }
        }}
      />

      {/* Global Back Button - Top Right */}
      {!hideBackButton && (
        <button
          onClick={handleBack}
          className="fixed top-24 right-6 z-[1200] p-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-full hover:bg-white hover:text-black transition-all group"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* Main Content Area - Native Scroll */}
      <main className="relative z-0 flex-1 flex flex-col w-full">
        {currentView === AppView.LANDING && <Hero setView={handleSetView} />}
        {currentView === AppView.DASHBOARD && (
          <ErrorBoundary>
            <Dashboard setView={handleSetView} user={user} />
          </ErrorBoundary>
        )}
        {currentView === AppView.PLANNER && (
          <TripPlanner
            prompt={planningPrompt}
            setPrompt={setPlanningPrompt}
            isLoggedIn={isLoggedIn}
            user={user}
            setView={handleSetView}
            setNavVisible={() => { }}
          />
        )}
        {currentView === AppView.DINING && <DiningConcierge />}
        {currentView === AppView.ABOUT && <About />}
        {currentView === AppView.HOW_IT_WORKS && <HowItWorks />}
        {currentView === AppView.PRICING && <Pricing />}
        {currentView === AppView.BLOG && <Blog />}
        {currentView === AppView.REWARDS && <Rewards />}
        {currentView === AppView.WALLET && <Wallet />}
        {currentView === AppView.SUPPORT && <Support />}
        {currentView === AppView.TRAVEL_DNA && <TravelDNA />}
        {currentView === AppView.COMMUNITY && <Community />}
        {currentView === AppView.MARKETPLACE && <Marketplace />}
        {currentView === AppView.ACHIEVEMENTS && <Achievements />}
        {currentView === AppView.SUSTAINABILITY && <Sustainability />}
        {currentView === AppView.INTEGRATIONS && <Integrations />}
        {currentView === AppView.REFERRALS && <Referral />}
        {currentView === AppView.AUTH && (
          <ErrorBoundary>
            <Auth setView={handleSetView} setUser={setUser} initialError={authError} />
          </ErrorBoundary>
        )}
      </main>

      {/* Footer - Only show on Marketing pages AND when NOT logged in */}
      {!isLoggedIn && currentView !== AppView.AUTH && currentView !== AppView.DASHBOARD && currentView !== AppView.PLANNER && (
        <footer className="border-t border-white/5 bg-black py-16 relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-6">Voyageur</h3>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                The intersection of artificial intelligence and human expertise.
                Redefining travel planning for the modern era.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li onClick={() => handleSetView(AppView.PLANNER)} className="hover:text-blue-400 cursor-pointer transition-colors">Trip Planner</li>
                <li onClick={() => handleSetView(AppView.DINING)} className="hover:text-blue-400 cursor-pointer transition-colors">Dining Concierge</li>
                <li onClick={() => handleSetView(AppView.PRICING)} className="hover:text-blue-400 cursor-pointer transition-colors">Membership</li>
                <li onClick={() => handleSetView(AppView.REWARDS)} className="hover:text-blue-400 cursor-pointer transition-colors">Rewards</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li onClick={() => handleSetView(AppView.ABOUT)} className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                <li onClick={() => handleSetView(AppView.HOW_IT_WORKS)} className="hover:text-blue-400 cursor-pointer transition-colors">How it Works</li>
                <li onClick={() => handleSetView(AppView.BLOG)} className="hover:text-blue-400 cursor-pointer transition-colors">Journal</li>
                <li onClick={() => handleSetView(AppView.SUPPORT)} className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-xs uppercase tracking-wider">
            <span>© 2024 Voyageur AI Inc.</span>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
