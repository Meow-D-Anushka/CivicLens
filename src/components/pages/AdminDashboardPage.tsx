import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockComplaints } from '../../data/mockComplaints';
import { 
  BarChart3, 
  Map as MapIcon, 
  Search, 
  Filter, 
  Clock, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { ComplaintStatus } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');

  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === 'Pending Review').length;
  const verified = mockComplaints.filter(c => c.status === 'Verified Outage').length;
  const duplicate = mockComplaints.filter(c => c.status === 'Duplicate').length;

  const filteredComplaints = mockComplaints.filter(c => 
    statusFilter === 'All' ? true : c.status === statusFilter
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="editorial-meta text-black mb-3 block">02 // Control Center</span>
          <h1 className="text-5xl md:text-6xl text-black uppercase tracking-[-0.05em]">
            System Operations
          </h1>
        </div>

        <div className="flex bg-white p-1 border border-black">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all cursor-none ${
              activeTab === 'list' ? 'bg-black text-white' : 'text-black hover:bg-[#F5F5F5]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all cursor-none ${
              activeTab === 'map' ? 'bg-black text-white' : 'text-black hover:bg-[#F5F5F5]'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Ingested', val: total },
          { label: 'Awaiting Action', val: pending },
          { label: 'Verified Outages', val: verified },
          { label: 'AI Deduplicated', val: duplicate }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="editorial-meta text-xs mb-2">{stat.label}</p>
            <p className="text-5xl font-bold tracking-tight text-black">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Main List Area */}
      <div className="bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-black flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#FAFAFA]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input 
              type="text" 
              placeholder="Query report ID, location..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none cursor-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-[#737373] shrink-0 mr-2" />
            {['All', 'Pending Review', 'Verified Outage', 'Duplicate'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-colors cursor-none ${
                  statusFilter === status 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-black border-black/20 hover:border-black'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-black">
                <th className="px-6 py-4 editorial-meta text-xs text-black">Report ID</th>
                <th className="px-6 py-4 editorial-meta text-xs text-black">Location</th>
                <th className="px-6 py-4 editorial-meta text-xs text-black">Classification</th>
                <th className="px-6 py-4 editorial-meta text-xs text-black">Confidence</th>
                <th className="px-6 py-4 editorial-meta text-xs text-black">Status</th>
                <th className="px-6 py-4 editorial-meta text-xs text-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredComplaints.map((complaint) => (
                <tr 
                  key={complaint.id} 
                  className="hover:bg-[#FAFAFA] transition-colors group cursor-none"
                  onClick={() => navigateTo('details', complaint.id)}
                >
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs font-bold text-black">{complaint.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-black">{complaint.locationName}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-[#525252]">{complaint.issueType}</span>
                  </td>
                  <td className="px-6 py-5">
                    {complaint.aiConfidence ? (
                      <span className="font-mono text-xs font-bold text-black">{complaint.aiConfidence}%</span>
                    ) : (
                      <span className="text-sm text-[#737373]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-black bg-white text-black">
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      className="text-xs font-bold uppercase tracking-wider text-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end w-full gap-1 cursor-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('details', complaint.id);
                      }}
                    >
                      Inspect <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredComplaints.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <AlertCircle className="w-10 h-10 text-[#737373] mb-4" />
              <p className="text-[#525252] font-mono text-xs uppercase">No telemetry data matches the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
