"use client";

import { useState } from 'react';
import { Search, Users, ShieldCheck, Star, Zap, PenTool, CircleDollarSign, Trophy } from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'freelancers'>('clients');

  const clientSteps = [
    {
      title: "Search Services",
      desc: "Browse manually vetted services and top-tier expertise across categories.",
      icon: <Search className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Choose Your Expert",
      desc: "Review portfolios, verified reviews, and case studies to find your match.",
      icon: <Users className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Pay Securely",
      desc: "Funds are held in secure escrow and only released when you're 100% happy.",
      icon: <ShieldCheck className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Receive & Review",
      desc: "Get your high-quality delivery and share your experience with the community.",
      icon: <Star className="text-gray-700" size={20} strokeWidth={1.5} />
    }
  ];

  const freelancerSteps = [
    {
      title: "Create a Package",
      desc: "Sign up, setup your package, and offer your work to our global audience.",
      icon: <PenTool className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Deliver Great Work",
      desc: "Get notified when you get an order and use our system to discuss details.",
      icon: <Zap className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Get Paid",
      desc: "Get paid on time, every time. Payment is transferred to you upon completion.",
      icon: <CircleDollarSign className="text-gray-700" size={20} strokeWidth={1.5} />
    },
    {
      title: "Build Reputation",
      desc: "Collect reviews from clients to build trust and attract even more orders.",
      icon: <Trophy className="text-gray-700" size={20} strokeWidth={1.5} />
    }
  ];

  const steps = activeTab === 'clients' ? clientSteps : freelancerSteps;

  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-600 mb-4">How Workvence Works</h2>
          <p className="text-gray-500 text-lg mb-8">A simple, secure experience for both clients and freelancers.</p>
          
          <div className="flex bg-[#f1f3f5] p-[6px] rounded-full shadow-inner">
            <button 
              onClick={() => setActiveTab('clients')}
              className={`px-8 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                activeTab === 'clients' 
                  ? 'bg-white text-brand-green shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              For Clients
            </button>
            <button 
              onClick={() => setActiveTab('freelancers')}
              className={`px-8 py-2.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                activeTab === 'freelancers' 
                  ? 'bg-white text-brand-green shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              For Freelancers
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] mb-8">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
