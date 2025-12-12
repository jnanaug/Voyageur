import React from 'react';
import { MessageSquare, Cpu, UserCheck, Plane } from 'lucide-react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <MessageSquare className="w-6 h-6 text-white" />,
            title: "1. The Prompt",
            desc: "Tell us about your dream weekend. Be as vague ('Beach trip') or specific ('Tokyo jazz bars and sushi') as you like.",
            color: "bg-cyan-500"
        },
        {
            icon: <Cpu className="w-6 h-6 text-white" />,
            title: "2. The Draft",
            desc: "Our Gemini AI engine constructs a logistical framework in seconds, checking opening times, distances, and budgets.",
            color: "bg-teal-500"
        },
        {
            icon: <UserCheck className="w-6 h-6 text-white" />,
            title: "3. The Review",
            desc: "A local expert reviews the plan. They spot that the museum is closed for renovations or that the restaurant went downhill.",
            color: "bg-orange-500"
        },
        {
            icon: <Plane className="w-6 h-6 text-white" />,
            title: "4. The Execution",
            desc: "We book everything. You get a dynamic digital itinerary that updates in real-time if flights change.",
            color: "bg-emerald-500"
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-4 block bg-cyan-950/30 inline-block px-3 py-1 border border-cyan-500/30 rounded-full">Workflow</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-sans tracking-tight">From thought to tarmac.</h2>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-orange-500/50 to-transparent md:-translate-x-1/2" />

                <div className="space-y-12 relative z-10">
                    {steps.map((step, idx) => (
                        <div key={idx} className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                            {/* Text Content */}
                            <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'} pl-16 md:pl-0`}>
                                <h3 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">{step.title}</h3>
                                <p className="text-zinc-400 font-sans leading-relaxed">{step.desc}</p>
                            </div>

                            {/* Icon Bubble */}
                            <div className="absolute left-0 md:left-1/2 -translate-x-0 md:-translate-x-1/2 w-12 h-12 rounded-full border-4 border-black shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center z-10 bg-black">
                                <div className={`w-full h-full rounded-full flex items-center justify-center ${step.color} shadow-inner bg-opacity-20 backdrop-blur-sm border border-white/20`}>
                                    {step.icon}
                                </div>
                            </div>

                            {/* Spacer for other side */}
                            <div className="flex-1 hidden md:block" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-24 bg-slate-900/50 rounded-2xl p-8 border border-white/5 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to go?</h3>
                <p className="text-slate-400 mb-8">Try the planner today. No account needed for the first draft.</p>
                <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-cyan-50 transition-colors">Start Planning</button>
            </div>
        </div>
    );
};

export default HowItWorks;