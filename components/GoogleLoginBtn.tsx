
import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import { supabase } from '../services/supabaseClient';
import { AppView } from '../types';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface GoogleLoginBtnProps {
    onSuccess: (user: any) => void;
    onError: (error: string) => void;
    setView: (view: AppView) => void;
    isSignup?: boolean;
}

// Helper to decode JWT payload safely
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const GoogleLoginBtn: React.FC<GoogleLoginBtnProps> = ({ onSuccess, onError, setView, isSignup = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingCredential, setPendingCredential] = useState<string | null>(null);
    const [pendingUser, setPendingUser] = useState<{ name: string; email: string; picture: string } | null>(null);

    const processLogin = async (credential: string) => {
        setIsLoading(true);
        try {
            console.log("Verifying Google Token with Backend...", { isSignup });

            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            // Ensure we don't have double /api or missing /api
            const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

            console.log("Using API URL:", API_URL);
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: credential,
                    intent: isSignup ? 'signup' : 'login'
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            if (data.needsOnboarding) {
                console.log("User needs onboarding. Redirecting to Signup...");
                onError("Account does not exist. Please Sign Up first.");
                setView(AppView.AUTH);
            } else {
                console.log("User verified. Logging in...");
                const { error } = await supabase.auth.setSession(data.session);
                if (error) throw error;
                onSuccess(data.user);
            }

        } catch (err: any) {
            console.error("Google Auth Error:", err);
            onError(err.message || "Login failed");
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
        }
    };

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        const { credential } = credentialResponse;

        if (!credential) {
            onError("No credential received from Google");
            return;
        }

        if (isSignup) {
            setIsLoading(true);
            try {
                // 1. Pre-check if user exists
                // 1. Pre-check if user exists
                // 1. Pre-check if user exists
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
                const res = await fetch(`${API_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: credential, intent: 'check' }),
                });
                const data = await res.json();

                if (data.exists) {
                    onError("Account already exists. Please Sign In.");
                    return;
                }

                // 2. If not exists, Show Confirmation
                const payload = decodeJwt(credential);
                if (payload) {
                    setPendingUser({
                        name: payload.name,
                        email: payload.email,
                        picture: payload.picture
                    });
                    setPendingCredential(credential);
                    setShowConfirm(true);
                } else {
                    processLogin(credential);
                }

            } catch (err) {
                console.error("Check failed:", err);
                onError("Verification failed");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Direct login
            processLogin(credential);
        }
    };

    return (
        <div className="w-full relative">
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center rounded">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
            )}

            <div className={`flex justify-center w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`} style={{ minHeight: '40px' }}>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => onError("Google Login Failed")}
                        theme="filled_black"
                        shape="rectangular"
                        size="large"
                        size="large"
                        logo_alignment="left"
                        text={isSignup ? "signup_with" : "signin_with"}
                    />
                </GoogleOAuthProvider>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && pendingUser && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                <img src={pendingUser.picture} alt={pendingUser.name} className="w-full h-full object-cover" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">Confirm Account Creation</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                You are about to create a new account as:
                                <br />
                                <span className="text-white font-medium block mt-1">{pendingUser.name}</span>
                                <span className="text-cyan-400 text-xs">{pendingUser.email}</span>
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => pendingCredential && processLogin(pendingCredential)}
                                    className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    Confirm <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleLoginBtn;
