import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Activity, Zap, Shield, ChevronRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="w-full flex flex-col items-center pt-32 pb-20 px-4">
      {/* Hero Section */}
      <section className="max-w-5xl w-full flex flex-col items-center text-center z-10 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-300 font-mono">CivicLens OS v2.0</span>
        </div>
        
        <h1 className="font-heading text-6xl sm:text-8xl md:text-9xl text-white leading-[0.85] tracking-tight mb-6 drop-shadow-2xl">
          Municipal <br />
          <span className="text-shimmer">Intelligence</span>
        </h1>
        
        <p className="max-w-2xl text-neutral-400 text-lg md:text-xl font-light mb-10">
          Our AI checks nearby complaints to reduce duplicates and identify possible wider outages instantly. Report issues with pinpoint GIS accuracy.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Shiny Border Button */}
          <button 
            onClick={() => navigateTo('report')}
            className="group relative inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden cursor-pointer"
          >
            <span className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,#8b5cf6_40%,#06b6d4_50%,transparent_60%)] animate-[spin_4s_linear_infinite]" />
            <span className="relative flex items-center gap-2 px-8 py-4 bg-[#0a0a0a] rounded-full font-medium text-white transition-all group-hover:bg-[#151515]">
              Report an Issue
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Secondary CTA */}
          <button 
            onClick={() => navigateTo('dashboard')}
            className="text-neutral-400 hover:text-white font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            View Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Metrics Ticker */}
      <section className="w-full max-w-7xl border-y border-white/5 bg-[#000000]/40 py-5 mb-24 overflow-hidden flex justify-center backdrop-blur-sm z-10">
        <div className="flex flex-wrap justify-center gap-10 md:gap-24 px-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">Active Scans</span>
            <span className="font-mono text-cyan-400">14,203</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">AI Deduplication</span>
            <span className="font-mono text-violet-400">99.8%</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">Avg Response</span>
            <span className="font-mono text-white">120ms</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">System Status</span>
            <span className="font-mono text-emerald-400">Nominal</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 z-10 mb-24 px-4">
        {[
          { icon: <Zap className="w-6 h-6 text-cyan-400" />, title: 'Instant Verification', desc: 'Real-time AI analysis checks your photo against our database to flag existing reports instantly.' },
          { icon: <Activity className="w-6 h-6 text-violet-400" />, title: 'Outage Clustering', desc: 'Automatically groups nearby singular complaints into wide-area outage alerts for grid maintenance.' },
          { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'Smart GIS Pinning', desc: 'Sub-meter accuracy drops exact geolocation coordinates into the municipal maintenance queue.' }
        ].map((feature, i) => (
          <div key={i} className="synapse-card p-10 rounded-[24px] flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
              {feature.icon}
            </div>
            <h3 className="font-heading text-3xl text-white mb-3">{feature.title}</h3>
            <p className="text-neutral-400 font-light leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Code Integration Block */}
      <section className="max-w-4xl w-full z-10 px-4">
        <div className="bg-[#080808]/90 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="ml-4 font-mono text-[11px] tracking-wider text-neutral-500">api/v1/analyze-report.ts</span>
          </div>
          <div className="p-6 md:p-8 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
            <pre>
              <span className="text-violet-400">const</span> <span className="text-blue-400">analyzeProximity</span> <span className="text-white">=</span> <span className="text-violet-400">async</span> (payload: <span className="text-cyan-400">Report</span>) <span className="text-violet-400">=&gt;</span> {'{'}
              <br />  <span className="text-neutral-500">{'//'} Initialize Synapse Engine</span>
              <br />  <span className="text-violet-400">const</span> match <span className="text-white">=</span> <span className="text-violet-400">await</span> <span className="text-cyan-400">AI</span>.<span className="text-blue-400">findDuplicates</span>({'{'}
              <br />    lat: payload.<span className="text-cyan-400">location</span>.<span className="text-white">lat</span>,
              <br />    lng: payload.<span className="text-cyan-400">location</span>.<span className="text-white">lng</span>,
              <br />    radius: <span className="text-emerald-400">15</span>, <span className="text-neutral-500">{'//'} meters</span>
              <br />  {'}'});
              <br />
              <br />  <span className="text-violet-400">return</span> match.<span className="text-cyan-400">confidence</span> <span className="text-white">&gt;</span> <span className="text-emerald-400">0.85</span> 
              <br />    ? <span className="text-cyan-400">Response</span>.<span className="text-blue-400">flagDuplicate</span>(match)
              <br />    : <span className="text-cyan-400">Response</span>.<span className="text-blue-400">processNew</span>(payload);
              <br />{'}'};
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
