
import React from 'react';
import { MessageSquare, Mail, Search, ChevronDown, Phone } from 'lucide-react';

const Support: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <div className="pt-32 pb-12 px-6 mx-auto max-w-7xl text-center">
                <span className="inline-block py-1 mb-4 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-900/10 rounded-full px-3 border border-cyan-500/20 font-mono">
                    Contact
                </span>
                <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-6xl uppercase">
                    Mission Control
                </h1>
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input type="text" placeholder="Search knowledge base..." className="w-full bg-black/50 backdrop-blur-md border border-white/20 pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all font-sans text-sm rounded-lg" />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 hover:border-cyan-400/50 transition-all text-center group cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] rounded-xl">
                    <MessageSquare className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2 font-sans">Live Chat</h3>
                    <p className="text-zinc-500 text-sm font-sans">24/7 Agent Support</p>
                </div>
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 hover:border-cyan-400/50 transition-all text-center group cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] rounded-xl">
                    <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2 font-sans">Email Ticket</h3>
                    <p className="text-zinc-500 text-sm font-sans">Response in 2h</p>
                </div>
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 hover:border-cyan-400/50 transition-all text-center group cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] rounded-xl">
                    <Phone className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2 font-sans">Emergency</h3>
                    <p className="text-zinc-500 text-sm font-sans">Priority Line</p>
                </div>
            </div>

            <div className="border-t border-white/10 pt-12">
                <h3 className="text-xl font-bold text-white mb-8 uppercase">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <FAQItem q="How do I modify a booked itinerary?" a="Contact the concierge via chat. Changes within 24h of travel may incur fees." />
                    <FAQItem q="Is my data shared with third parties?" a="No. We only share necessary details with airlines and hotels for booking purposes." />
                    <FAQItem q="How do Voyager Points work?" a="Earn points for every dollar spent. Redeem them for discounts or exclusive experiences." />
                    <FAQItem q="Can I add a co-traveler after booking?" a="Yes, navigate to the 'Trips' page and select 'Manage Travelers'." />
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ q, a }: { q: string, a: string }) => (
    <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 cursor-pointer hover:bg-white/5 transition-all group hover:border-white/30 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-cyan-400 transition-colors font-sans">{q}</h4>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed font-sans">{a}</p>
    </div>
);

export default Support;
