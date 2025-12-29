import React, { useEffect } from 'react';

const CancellationRefund: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <div className="pt-0 pb-12 px-6 mx-auto max-w-7xl text-center">
                <span className="inline-block py-1 mb-4 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-900/10 rounded-full px-3 border border-cyan-500/20 font-mono">
                    Legal
                </span>
                <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-5xl uppercase">
                    Cancellation & Refunds
                </h1>
                <p className="max-w-2xl mx-auto font-sans text-lg text-zinc-400 leading-relaxed">
                    Clear, fair, and transparent policies for your peace of mind.
                </p>
            </div>

            <div className="space-y-12 text-zinc-400 font-sans leading-relaxed text-sm md:text-base mb-20">
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">1. Cancellation Policy</h3>
                    <p className="mb-4">
                        Since Voyageur AI provides instant digital itinerary generation services, cancellation is not applicable for individual trip credits once used.
                        However, if you have purchased a credit pack and have not used any credits, you may request a cancellation within 24 hours of purchase.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">2. Refund Policy</h3>
                    <p className="mb-4">
                        We strive to provide the best AI-powered travel planning experience. If you are not satisfied with our service, please contact us at <span className="text-white">support@voyageur.ai</span>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                        <li><strong className="text-zinc-300">Itinerary Generation Failures:</strong> If the system fails to generate an itinerary but deducts a credit, we will automatically refund the credit to your account. If you paid for a single trip directly, we will process a full refund to your original payment method within 5-7 business days.</li>
                        <li><strong className="text-zinc-300">Unused Credits:</strong> Refunds for unused credit packs can be requested within 7 days of purchase, provided no credits have been used.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">3. Processing Time</h3>
                    <p className="mb-4">
                        Approved refunds will be processed within 5-7 business days and credited back to the original payment source (Credit Card/Debit Card/UPI).
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">4. Contact Us</h3>
                    <p>
                        If you have any questions about our Cancellation and Refund Policy, please contact us by email: <a href="mailto:support@voyageur.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">support@voyageur.ai</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CancellationRefund;
