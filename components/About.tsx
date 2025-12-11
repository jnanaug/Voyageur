import React from 'react';
import { Shield, Cpu, Users, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-20 animate-fade-in-up">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          The Human <span className="text-cyan-400">&</span> Machine <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Collaboration.</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We believe AI shouldn't replace human taste—it should amplify it. Voyageur is the first platform that combines generative power with concierge-level human verification.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-12 mb-24">
        <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-colors" />
            <Cpu className="w-12 h-12 text-cyan-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">The Engine</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
                Our Gemini-powered core processes millions of flight paths, hotel reviews, and local events in seconds. It builds the skeleton of your trip with mathematical precision, optimizing for travel time and budget constraints.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Real-time availability checks</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Dynamic weather adaptation</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Cost prediction models</li>
            </ul>
        </div>

        <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-colors" />
            <Users className="w-12 h-12 text-orange-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">The Curators</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
                Algorithms can't taste the wine or feel the vibe of a jazz club. Our network of local experts in 50+ cities verifies every itinerary. They swap out the "tourist traps" for the hidden gems that only locals know.
            </p>
             <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Vibe checks & atmosphere verification</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Exclusive reservation access</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> 24/7 on-trip support</li>
            </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-12">
          <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Global Cities</div>
          </div>
          <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24h</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Turnaround Time</div>
          </div>
          <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Trips Planned</div>
          </div>
          <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99%</div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Satisfaction</div>
          </div>
      </div>
    </div>
  );
};

export default About;