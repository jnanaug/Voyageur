
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

            <div className="space-y-12 text-zinc-400 font-sans leading-relaxed text-sm md:text-base mb-20">
                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">1. Overview</h3>
                    <p className="mb-4">
                        This website is operated by Voyageur AI Inc. Throughout the site, the terms "we", "us" and "our" refer to Voyageur. Voyageur offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">2. Intelligence Services</h3>
                    <p className="mb-4">
                        Voyageur provides AI-driven travel planning and logistics services. By using our "Logistics Engine," you acknowledge that:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                        <li>Recommendations are generated algorithms and should be verified.</li>
                        <li>We are not responsible for third-party changes (flight cancellations, restaurant closures).</li>
                        <li>Booking services are facilitated through third-party partners; their terms also apply.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">3. User Conduct</h3>
                    <p className="mb-4">You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                        <li>Use our service for any unlawful purpose.</li>
                        <li>Attempt to reverse engineer our AI models or scrape data.</li>
                        <li>Submit false or misleading information used for itinerary generation.</li>
                        <li>Through valid feedback mechanisms, harass or abuse our support staff.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">4. Intellectual Property</h3>
                    <p className="mb-4">
                        All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Voyageur or its content suppliers and protected by international copyright laws.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">5. Limitation of Liability</h3>
                    <p className="mb-4">
                        In no case shall Voyageur, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold uppercase tracking-wide mb-4 text-lg">6. Governing Law</h3>
                    <p>
                        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the State of California.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
