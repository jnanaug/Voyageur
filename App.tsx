
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
import Billing from './components/Billing';
import Notifications from './components/Notifications';
import Referral from './components/Referral';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import CancellationRefund from './components/CancellationRefund';
import ShippingPolicy from './components/ShippingPolicy';
import UpdatePassword from './components/UpdatePassword';
import { AppView, UserProfile } from './types';
import { dbService } from './services/dbService';
import { supabase } from './services/supabaseClient'; // Import supabase client
import LoadingScreen from './components/LoadingScreen';
import IntroLoader from './components/IntroLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { useDelayedLoading } from './hooks/useDelayedLoading';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.LANDING);
  const [history, setHistory] = useState<AppView[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [planningPrompt, setPlanningPrompt] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isHydrating, setIsHydrating] = useState(false); // Prevents "Traveler" flash on fresh login

  const [authError, setAuthError] = useState<string | null>(null);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'overview' | 'prompts' | 'settings'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voyageur_dashboard_active_tab');
      return (saved === 'overview' || saved === 'prompts' || saved === 'settings') ? saved : 'overview';
    }
    return 'overview';
  });
  const [navVisible, setNavVisible] = useState(true); // NEW: Manage global nav visibility

  const [authChecked, setAuthChecked] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const isLoggedIn = !!user;

  // Scroll to top whenever the view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle URL Error Params and Password Reset Route (Global)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    // Handle password reset link from email
    // Supabase sends recovery token in URL hash like: #access_token=...&type=recovery
    if (hash.includes('type=recovery') || pathname === '/update-password') {
      setView(AppView.UPDATE_PASSWORD);
      // Clean the URL but keep hash for Supabase to process the token
      if (pathname === '/update-password') {
        window.history.replaceState({}, '', '/' + window.location.hash);
      }
    }
    // Handle no_account error
    else if (params.get('error') === 'no_account') {
      // Set error state to pass to Auth component
      setAuthError("Account does not exist. Please Sign Up first.");
      // Force view to AUTH
      setView(AppView.AUTH);
      // Clean URL immediately so it doesn't persist on refresh/navigation
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check for 'view' query param (For Razorpay/Compliance links)
    const viewParam = params.get('view');
    if (viewParam) {
      if (viewParam === 'refund') setView(AppView.REFUND);
      else if (viewParam === 'shipping') setView(AppView.SHIPPING);
      else if (viewParam === 'terms') setView(AppView.TERMS);
      else if (viewParam === 'privacy') setView(AppView.PRIVACY);
      else if (viewParam === 'contact') setView(AppView.SUPPORT);
      else if (viewParam === 'pricing') setView(AppView.PRICING);
    }
  }, []);

  // Clear auth error when switching views
  useEffect(() => {
    if (currentView !== AppView.AUTH) {
      setAuthError(null);
    }
  }, [currentView]);

  // Handle Pending Purchase Redirect
  useEffect(() => {
    if (user) {
      const pending = localStorage.getItem('pending_purchase');
      if (pending) {
        console.log("💳 [App] Found pending purchase, redirecting to Pricing...");
        setView(AppView.PRICING);
        // We don't clear it here, Pricing component will handle/clear it
      }
    }
  }, [user]);

  // Listen for user profile updates from Dashboard
  useEffect(() => {
    const handleUserUpdate = (e: any) => {
      const { fullName } = e.detail;
      if (fullName) {
        console.log("🔄 [App] Received user update event:", fullName);
        setUser(prev => prev ? { ...prev, fullName } : null);
      }
    };

    window.addEventListener('voyageur:user-update', handleUserUpdate);
    return () => window.removeEventListener('voyageur:user-update', handleUserUpdate);
  }, []);

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

          // Unified Session Handling (Stateless)
          // Read cached credits and name from localStorage to prevent flicker
          console.log("🔍 [App.tsx] RAW Session Metadata:", session.user.user_metadata);
          const cachedCredits = parseInt(localStorage.getItem(`voyageur_credits_${session.user.id}`) || '0', 10);
          const cachedName = localStorage.getItem(`voyageur_fullname_${session.user.id}`);

          // FAST PATH: Cache exists, render immediately
          if (cachedName) {
            setUser({
              id: session.user.id,
              fullName: cachedName,
              email: session.user.email!,
              credits: cachedCredits,
              createdAt: new Date(session.user.created_at).getTime()
            });
            setIsHydrating(false);
          } else {
            // SLOW PATH: No cache (Fresh login/Cleared). Block UI to prevent "Traveler" flash.
            console.log("⏳ [App.tsx] Hydrating from DB...");
            setIsHydrating(true);
          }

          // Fetch fresh profile (credits + name) in background
          dbService.getUserProfile(session.user.id).then(profile => {
            if (mounted && profile) {
              console.log("👤 [App.tsx] Profile fetched:", profile);

              // Update localStorage cache for next load
              localStorage.setItem(`voyageur_credits_${session.user.id}`, profile.credits.toString());
              if (profile.fullName) localStorage.setItem(`voyageur_fullname_${session.user.id}`, profile.fullName);

              // Update state (This will be the FIRST render if no cache was found)
              setUser(prev => ({
                id: session.user.id,
                fullName: profile.fullName || (prev?.fullName) || session.user.user_metadata.full_name || "Traveler",
                email: session.user.email!,
                credits: profile.credits,
                createdAt: new Date(session.user.created_at).getTime()
              }));

              // Unblock UI once data is ready
              setIsHydrating(false);
            }
          }).catch(e => {
            console.error("❌ [App.tsx] Failed to fetch profile:", e);
            // Fallback: If DB fails and we blocked UI, unblock and show what we have
            if (!cachedName) {
              setUser({
                id: session.user.id,
                fullName: session.user.user_metadata.full_name || "Traveler",
                email: session.user.email!,
                credits: cachedCredits,
                createdAt: new Date(session.user.created_at).getTime()
              });
            }
            setIsHydrating(false);
          });

          // FIX: If name is "Traveler", it might be a stale session. Force refresh.
          if (!session.user.user_metadata.full_name) {
            console.log("🔄 [App.tsx] Name missing. Forcing session refresh...");
            supabase.auth.refreshSession();
          }

          // Auto-redirect to dashboard on login
          if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN') {
            setView((prev) => (prev === AppView.LANDING || prev === AppView.AUTH) ? AppView.DASHBOARD : prev);
          }

          // HIDE INTRO if logged in
          setShowIntro(false);
          setAuthChecked(true);

        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          setIsHydrating(false);
          if (typeof window !== 'undefined') localStorage.removeItem('voyageur_dashboard_active_tab');
          setView((prev) => prev === AppView.DASHBOARD ? AppView.AUTH : prev);
        } else if ((_event as string) === 'TOKEN_REFRESH_REVOKED') {
          console.log("🛑 [App.tsx] Token Refresh Revoked (Session Expired)");
          setUser(null);
          setAuthError("Session expired. Please sign in again.");
          if (typeof window !== 'undefined') localStorage.removeItem('voyageur_dashboard_active_tab');
          setView(AppView.AUTH);
          setIsHydrating(false);
        } else {
          setUser(null);
          setIsHydrating(false);
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
        // If NO session, enable intro. If session exists, onAuthStateChange handles it.
        if (!session) {
          setShowIntro(true);
          setAuthChecked(true);
          setIsLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
      setAuthChecked(true);
      setShowIntro(true); // Offline mode -> show intro
    }
  }, []);

  // Listen for global user updates (e.g. credits change)
  useEffect(() => {
    const handleUserUpdate = async () => {
      if (user) {
        console.log("🔄 [App] Refreshing User Data (Credits)...");
        const credits = await dbService.getUserCredits(user.id);
        setUser(prev => prev ? ({ ...prev, credits }) : null);
      }
    };
    window.addEventListener('voyageur:user-update', handleUserUpdate);
    return () => window.removeEventListener('voyageur:user-update', handleUserUpdate);
  }, [user]);

  const handleSetView = (view: AppView, dashboardTab: 'overview' | 'prompts' | 'settings' = 'overview') => {
    setHistory((prev) => [...prev, currentView]);
    // Clear prompt when starting a new trip
    if (view === AppView.PLANNER && currentView !== AppView.PLANNER) {
      setPlanningPrompt('');
      // DO NOT clear selectedTrip here. It overrides the trip we just set in dashboard!
      // setSelectedTrip(null); 
    }

    // Reset dashboard tab if navigating there
    if (view === AppView.DASHBOARD) {
      setDashboardInitialTab(dashboardTab);
    }

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

  // Delay the busy indicator to avoid flashing for fast loads
  // Delay the busy indicator to avoid flashing for fast loads
  const showBusyLoader = useDelayedLoading(isLoading || isHydrating, 4000);

  // Black screen while checking auth to prevent flash
  if (!authChecked) {
    return <div className="min-h-screen bg-black" />;
  }

  if (showIntro) {
    return <IntroLoader onComplete={() => setShowIntro(false)} />;
  }

  // Fallback for internal loading states (after Intro is done)
  // We use a simple black screen to prevent "Vertical Bar" flashes during fast loads.
  if (isLoading || isHydrating) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-blue-500/30 flex flex-col relative">


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
        isVisible={navVisible} // Pass visibility state
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
            <Dashboard
              setView={handleSetView}
              user={user}
              initialTab={dashboardInitialTab}
              onLoadTrip={(trip) => {
                setSelectedTrip(trip);
                handleSetView(AppView.PLANNER);
              }}
            />
          </ErrorBoundary>
        )}
        {currentView === AppView.PLANNER && (
          <TripPlanner
            prompt={planningPrompt}
            setPrompt={setPlanningPrompt}
            isLoggedIn={isLoggedIn}
            user={user}
            setView={handleSetView}
            setNavVisible={setNavVisible} // Pass setter to TripPlanner
            initialTrip={selectedTrip}
            clearSelectedTrip={() => setSelectedTrip(null)}
            onBackToLogs={() => {
              setSelectedTrip(null); // Clear trip when going back manually
              handleSetView(AppView.DASHBOARD, 'prompts');
            }}
          />
        )}
        {currentView === AppView.DINING && <DiningConcierge />}
        {currentView === AppView.ABOUT && <About />}
        {currentView === AppView.HOW_IT_WORKS && <HowItWorks />}
        {currentView === AppView.PRICING && <Pricing user={user} setView={handleSetView} />}
        {currentView === AppView.BLOG && <Blog />}
        {currentView === AppView.REWARDS && <Rewards />}
        {currentView === AppView.WALLET && <Wallet />}
        {currentView === AppView.SUPPORT && <Support />}
        {currentView === AppView.TRAVEL_DNA && <TravelDNA />}
        {currentView === AppView.COMMUNITY && <Community />}
        {currentView === AppView.MARKETPLACE && <Marketplace />}
        {currentView === AppView.ACHIEVEMENTS && <Achievements />}
        {currentView === AppView.SUSTAINABILITY && <Sustainability />}
        {currentView === AppView.BILLING && <Billing />}
        {currentView === AppView.NOTIFICATIONS && <Notifications />}
        {currentView === AppView.REFERRAL && <Referral />}
        {currentView === AppView.PRIVACY && <Privacy />}
        {currentView === AppView.TERMS && <Terms />}
        {currentView === AppView.REFUND && <CancellationRefund />}
        {currentView === AppView.SHIPPING && <ShippingPolicy />}
        {currentView === AppView.UPDATE_PASSWORD && <UpdatePassword setView={handleSetView} />}
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
              <span onClick={() => handleSetView(AppView.REFUND)} className="hover:text-white cursor-pointer transition-colors">Refunds</span>
              <span onClick={() => handleSetView(AppView.SHIPPING)} className="hover:text-white cursor-pointer transition-colors">Shipping</span>
              <span onClick={() => handleSetView(AppView.PRIVACY)} className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span onClick={() => handleSetView(AppView.TERMS)} className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
