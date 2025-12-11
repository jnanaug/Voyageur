
import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Star, Filter, Tag } from 'lucide-react';

const Marketplace: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Transport", "Connectivity", "Accessories", "Experience"];

    const items = [
        {
            title: "JR Rail Pass (7 Days)",
            price: "$245.00",
            category: "Transport",
            image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80"
        },
        {
            title: "Global eSIM Data Pack",
            price: "$35.00",
            category: "Connectivity",
            image: "https://images.unsplash.com/photo-1512428559087-560fa0db99b2?auto=format&fit=crop&q=80"
        },
        {
            title: "Voyageur Travel Kit",
            price: "$89.00",
            category: "Accessories",
            image: "https://images.unsplash.com/photo-1521587760-4025a4d041c5?auto=format&fit=crop&q=80"
        },
        {
            title: "Kyoto Tea Ceremony",
            price: "$120.00",
            category: "Experience",
            image: "https://images.unsplash.com/photo-1531263060782-b024de9b9793?auto=format&fit=crop&q=80"
        },
        {
            title: "Noise Cancelling Headphones",
            price: "$299.00",
            category: "Accessories",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80"
        },
         {
            title: "Private Airport Transfer",
            price: "$60.00",
            category: "Transport",
            image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80"
        }
    ];

    const filteredItems = activeCategory === "All" ? items : items.filter(i => i.category === activeCategory);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 uppercase tracking-tighter">Marketplace</h2>
                    <p className="text-zinc-500 font-mono">Curated essentials for the modern traveler.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-bold uppercase text-xs hover:bg-white hover:text-black transition-colors">
                    <ShoppingBag className="w-4 h-4" /> View Cart
                </button>
            </div>

            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 mb-12 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest w-fit mb-3">Limited Time Deal</div>
                        <h3 className="text-3xl font-bold text-white uppercase leading-none">Voyageur Elite Kit</h3>
                        <p className="text-black/70 font-bold mt-2">Get 50% off when you book a trip today.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-colors">
                        Claim Offer
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[50px] mix-blend-overlay" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-12">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 border text-xs font-bold uppercase tracking-wider transition-all ${
                            activeCategory === cat 
                            ? 'bg-white text-black border-white' 
                            : 'bg-black text-zinc-500 border-white/10 hover:border-white/50 hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {filteredItems.map((item, idx) => (
                    <div key={idx} className="bg-black border border-white/10 group hover:border-white/30 transition-all cursor-pointer">
                        <div className="h-64 overflow-hidden relative">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-0 right-0 bg-cyan-400 text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-white uppercase leading-tight">{item.title}</h3>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xl font-bold text-white">{item.price}</span>
                                <button className="p-2 border border-white/20 hover:bg-white hover:text-black transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
