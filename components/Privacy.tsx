
import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <div className="pt-0 pb-12 px-6 mx-auto max-w-7xl text-center">
                <span className="inline-block py-1 mb-4 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-900/10 rounded-full px-3 border border-cyan-500/20 font-mono">
                    Legal
                </span>
                <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl uppercase">
                    Privacy Policy
                </h1>
                <p className="max-w-2xl mx-auto font-sans text-lg text-zinc-400 leading-relaxed">
                    Your data is yours. We protect it with military-grade encryption.
                </p>
            </div>

            <div className="space-y-8 text-zinc-400 font-sans leading-relaxed text-sm md:text-base">
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">1. Data Collection</h3>
                    <p>We collect only the essential data required to power our AI logistics engine. This includes travel preferences, past itinerary feedback, and basic profile information. We do not sell your data to third-party advertisers.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">2. AI Processing</h3>
                    <p>Your data is processed by our Gemini-powered engine to generate recommendations. All personal identifiers are anonymized before processing where possible.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">3. Security</h3>
                    <p>We utilize Row Level Security (RLS) on our databases and standard JWT authentication to ensure only you can access your trip data.</p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
