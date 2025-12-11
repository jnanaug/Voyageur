
import React from 'react';
import { MessageSquare, Mail, Search, ChevronDown, Phone } from 'lucide-react';

const Support: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">Mission Control</h2>
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input type="text" placeholder="Search knowledge base..." className="w-full bg-black border border-white/20 pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono text-sm" />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-black border border-white/10 p-6 hover:border-cyan-400/50 transition-colors text-center group cursor-pointer">
                    <MessageSquare className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2">Live Chat</h3>
                    <p className="text-zinc-500 text-sm">24/7 Agent Support</p>
                </div>
                <div className="bg-black border border-white/10 p-6 hover:border-cyan-400/50 transition-colors text-center group cursor-pointer">
                    <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2">Email Ticket</h3>
                    <p className="text-zinc-500 text-sm">Response in 2h</p>
                </div>
                <div className="bg-black border border-white/10 p-6 hover:border-cyan-400/50 transition-colors text-center group cursor-pointer">
                    <Phone className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white uppercase mb-2">Emergency</h3>
                    <p className="text-zinc-500 text-sm">Priority Line</p>
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
    <div className="border border-white/10 bg-black p-6 cursor-pointer hover:bg-white/5 transition-colors group">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-cyan-400 transition-colors">{q}</h4>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
    </div>
);

export default Support;
