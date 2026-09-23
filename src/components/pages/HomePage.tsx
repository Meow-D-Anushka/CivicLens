import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Editorial Hero Section */}
      <section className="w-full px-6 pt-24 pb-20 flex flex-col items-start border-b border-black/10 max-w-[1400px]">
        <div className="overflow-hidden mb-6">
          <span className="block editorial-meta text-black animate-reveal">CivicLens OS v3.0 // High Contrast</span>
        </div>
        
        <div className="overflow-hidden">
          <h1 className="text-[12vw] md:text-9xl text-black animate-reveal uppercase">
            Municipal
          </h1>
        </div>
        <div className="overflow-hidden mb-12">
          <h1 className="text-[12vw] md:text-9xl text-black animate-reveal uppercase" style={{ animationDelay: '0.1s' }}>
            Intelligence.
          </h1>
        </div>
        
        <div className="max-w-2xl overflow-hidden mb-14">
          <p className="text-xl md:text-2xl animate-reveal" style={{ animationDelay: '0.2s' }}>
            Our AI checks nearby complaints to reduce duplicates and identify possible wider outages instantly. Report issues with brutal efficiency.
          </p>
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-8 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => navigateTo('report')}
              className="group flex items-center gap-4 px-10 py-5 bg-black text-white uppercase font-bold tracking-[0.1em] text-sm hover:bg-[#525252] transition-colors cursor-none"
            >
              Report an Issue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => navigateTo('dashboard')}
              className="editorial-meta text-black border-b border-black pb-1 hover:text-[#737373] hover:border-[#737373] transition-all cursor-none"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Section (Shortened Font Size) */}
      <section className="w-full border-b border-black/10 py-6 marquee-container overflow-hidden bg-white relative">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-xl md:text-3xl font-bold tracking-tight text-black uppercase">Active AI Radar</span>
              <span className="text-lg text-[#737373]">///</span>
              <span className="text-xl md:text-3xl font-bold tracking-tight text-black uppercase">Instant Verification</span>
              <span className="text-lg text-[#737373]">///</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Feature Grid with Fixed Streetlight Image */}
      <section className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-24">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden bg-[#F5F5F5] aspect-[4/3] w-full border border-black/10">
            <img 
              src="https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=1200" 
              alt="Dark Road" 
              className="editorial-image w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="editorial-meta mb-3 text-black">01. Smart GIS Pinning</p>
            <h3 className="text-3xl md:text-4xl text-black">Precision mapping for rapid municipal response.</h3>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:pt-32">
          <div className="overflow-hidden bg-[#F5F5F5] aspect-[4/3] w-full border border-black/10">
            <img 
              src="/flickering.jpg" 
              alt="Streetlight Infrastructure" 
              className="editorial-image w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="editorial-meta mb-3 text-black">02. Outage Clustering</p>
            <h3 className="text-3xl md:text-4xl text-black">Grouping singular reports into macro-alerts automatically.</h3>
          </div>
        </div>
      </section>

    </div>
  );
};
