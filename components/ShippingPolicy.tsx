import React, { useEffect } from 'react';

const ShippingPolicy: React.FC = () => {
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
                    Shipping & Delivery
                </h1>
                <p className="max-w-2xl mx-auto font-sans text-lg text-zinc-400 leading-relaxed">
                    Instant digital delivery for your modern adventures.
                </p>
            </div>

            <div className="space-y-12 text-zinc-400 font-sans leading-relaxed text-sm md:text-base mb-20">
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">1. Digital Delivery</h3>
                    <p className="mb-4">
                        Voyageur AI is a purely digital platform (SaaS). We do not sell or ship physical products. No physical shipping fees or timelines apply to our services.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">2. Delivery Timeline</h3>
                    <p className="mb-4">
                        <strong className="text-zinc-300">Minimum Timeline:</strong> Services (Trip Credits) are typically activated <strong>immediately</strong> (Instant) upon successful payment confirmation.
                    </p>
                    <p className="mb-4">
                        <strong className="text-zinc-300">Maximum Timeline:</strong> In case of technical delays or payment processing issues, the service will be delivered within <strong>48 hours</strong> of the transaction.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">3. Confirmation</h3>
                    <p className="mb-4">
                        You will receive a confirmation email and the credits will reflect in your Dashboard immediately upon delivery.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">4. Itinerary Delivery</h3>
                    <p className="mb-4">
                        Generated itineraries are delivered instantly within the application dashboard. A copy may also be sent to your registered email address for your records.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">5. Issues with Delivery</h3>
                    <p className="mb-4">
                        If you do not receive your credits or itinerary after payment, please check your network connection and refresh the dashboard. If the issue persists, please contact <a href="mailto:support@voyageur.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">support@voyageur.ai</a> with your Transaction ID.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ShippingPolicy;
