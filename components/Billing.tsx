
import React, { useState } from 'react';
import { CreditCard, Check, Download, Zap, Crown, AlertTriangle, Shield, Clock } from 'lucide-react';

const Billing: React.FC = () => {
    const [currentPlan, setCurrentPlan] = useState('Voyager');

    const invoices = [
        { id: "INV-2024-001", date: "Dec 01, 2024", amount: "$12.00", status: "Paid" },
        { id: "INV-2023-112", date: "Nov 01, 2024", amount: "$12.00", status: "Paid" },
        { id: "INV-2023-105", date: "Oct 01, 2024", amount: "$12.00", status: "Paid" },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">Billing & Plan</h2>
                <p className="text-zinc-500 font-mono">Manage your subscription and payment methods.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">

                    {/* Current Plan Card */}
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">Active</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-cyan-500/10 flex items-center justify-center rounded-full border border-cyan-500/20">
                                <Zap className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Voyager Plan</h3>
                                <p className="text-zinc-500 text-xs font-mono">$12.00 / month • Renews Jan 01, 2025</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-zinc-400 text-[10px] uppercase tracking-widest mb-1">AI Usage</div>
                                <div className="text-2xl font-bold text-white font-mono">124<span className="text-sm text-zinc-600">/unlimited</span></div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="text-zinc-400 text-[10px] uppercase tracking-widest mb-1">Storage</div>
                                <div className="text-2xl font-bold text-white font-mono">1.2<span className="text-sm text-zinc-600">GB</span></div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-white/5">
                                Change Plan
                            </button>
                            <button className="px-6 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">
                                Cancel Subscription
                            </button>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-zinc-400" /> Payment Methods
                        </h3>
                        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                                        {/* Mock Visa Logo */}
                                        <div className="text-[8px] font-bold text-blue-800 italic">VISA</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white font-mono">•••• •••• •••• 4242</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Expires 12/28</div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Default</span>
                            </div>
                            <div className="p-4 bg-zinc-900/50 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer border-t border-white/5">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">+ Add New Method</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-5 h-5 text-zinc-400" /> Invoice History
                        </h3>
                        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Invoice ID</th>
                                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-xs font-mono text-zinc-300">{inv.id}</td>
                                            <td className="p-4 text-xs text-zinc-400">{inv.date}</td>
                                            <td className="p-4 text-xs font-bold text-white">{inv.amount}</td>
                                            <td className="p-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{inv.status}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 p-6 rounded-xl">
                        <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center rounded-full mb-4">
                            <Crown className="w-5 h-5 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Voyageur Elite</h4>
                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            Upgrade to Elite for 24/7 human concierge service and exclusive access to private events.
                        </p>
                        <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-xs transition-colors shadow-lg shadow-purple-600/20">
                            Upgrade to Elite
                        </button>
                    </div>

                    <div className="border border-white/10 p-6 rounded-xl bg-black/30">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">
                            <Shield className="w-4 h-4" /> Secure Payment
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            All payments are processed securely via Stripe. We do not store your full card details.
                            <br /><br />
                            Need help? <a href="#" className="text-cyan-400 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
