
import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <div className="pt-0 pb-12 px-6 mx-auto max-w-7xl text-center">
                <span className="inline-block py-1 mb-4 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-900/10 rounded-full px-3 border border-cyan-500/20 font-mono">
                    Legal
                </span>
                <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl uppercase">
                    Terms of Service
                </h1>
                <p className="max-w-2xl mx-auto font-sans text-lg text-zinc-400 leading-relaxed">
                    The rules of engagement for the Voyageur platform.
                </p>
            </div>

            <div className="space-y-8 text-zinc-400 font-sans leading-relaxed text-sm md:text-base">
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">1. Acceptance</h3>
                    <p>By using Voyageur, you agree to these terms. Access to the platform is a privilege, not a right, and may be revoked for violations of our community standards.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">2. Usage Rights</h3>
                    <p>You grant Voyageur a non-exclusive license to use anonymized travel data to improve our routing algorithms. You retain full ownership of your personal content.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-3">3. Liability</h3>
                    <p>Voyageur provides travel recommendations via AI. We are not liable for flight cancellations, hotel closures, or other real-world disruptions. Always verify critical logistics.</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
