import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockComplaints } from '../../data/mockComplaints';
import { 
  BarChart3, 
  Map as MapIcon, 
  Search, 
  Filter, 
  ArrowRight,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { ComplaintStatus, Complaint } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [selectedPin, setSelectedPin] = useState<Complaint | null>(mockComplaints[0]);

  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === 'Pending Review').length;
  const verified = mockComplaints.filter(c => c.status === 'Verified Outage').length;
  const duplicate = mockComplaints.filter(c => c.status === 'Duplicate').length;

  const filteredComplaints = mockComplaints.filter(c => 
    statusFilter === 'All' ? true : c.status === statusFilter
  );

  const mapPins = [
    { complaint: mockComplaints[0], top: '35%', left: '25%' },
    { complaint: mockComplaints[1], top: '35%', left: '65%' },
    { complaint: mockComplaints[2], top: '65%', left: '45%' },
    { complaint: mockComplaints[3], top: '85%', left: '65%' },
  ];

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

      {/* Dynamic Tab Content (Feed vs GIS Map) */}
      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Interactive Map Area */}
          <div className="lg:col-span-8 bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-black">City Streetlight Grid Map</h3>
                <p className="text-xs text-[#525252] font-mono uppercase">Click any pin to inspect telemetry</p>
              </div>
            </div>

            <div className="relative h-[480px] w-full border border-black bg-white overflow-hidden">
              <svg viewBox="0 0 600 350" className="w-full h-full absolute inset-0 pointer-events-none">
                <rect width="600" height="350" fill="#FFFFFF" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#E5E5E5" strokeWidth="24" />
                <line x1="0" y1="240" x2="600" y2="240" stroke="#E5E5E5" strokeWidth="24" />
                <line x1="180" y1="0" x2="180" y2="350" stroke="#E5E5E5" strokeWidth="24" />
                <line x1="420" y1="0" x2="420" y2="350" stroke="#E5E5E5" strokeWidth="24" />
              </svg>

              {mapPins.map((pin, idx) => {
                const isSelected = selectedPin?.id === pin.complaint.id;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedPin(pin.complaint)}
                    style={{ top: pin.top, left: pin.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-none ${
                      isSelected 
                        ? 'bg-black text-white ring-4 ring-black/20 scale-125 z-20' 
                        : 'bg-white text-black border-2 border-black hover:scale-110 z-10'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Pin Inspection Panel */}
          <div className="lg:col-span-4 bg-white border border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            {selectedPin ? (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
                  <span className="editorial-meta text-xs">Pin Inspection</span>
                  <span className="font-mono text-xs font-bold text-black px-2.5 py-1 border border-black bg-[#FAFAFA]">
                    {selectedPin.id}
                  </span>
                </div>

                <div className="w-full h-48 border border-black overflow-hidden mb-6 bg-[#FAFAFA]">
                  <img 
                    src={selectedPin.photoUrl} 
                    alt={selectedPin.id} 
                    className="editorial-image w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <span className="editorial-meta text-[10px] block mb-1">Location</span>
                    <h4 className="text-lg font-bold text-black">{selectedPin.locationName}</h4>
                  </div>
                  <div>
                    <span className="editorial-meta text-[10px] block mb-1">Classification</span>
                    <p className="text-sm text-[#525252]">{selectedPin.issueType}</p>
                  </div>
                  <div>
                    <span className="editorial-meta text-[10px] block mb-1">Status</span>
                    <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-black bg-white text-black">
                      {selectedPin.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <MapPin className="w-10 h-10 text-[#737373] mb-4" />
                <p className="text-[#525252] font-mono text-xs uppercase">Select a pin on the map to inspect telemetry data.</p>
              </div>
            )}

            {selectedPin && (
              <button
                onClick={() => navigateTo('details', selectedPin.id)}
                className="w-full py-4 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none"
              >
                <span>Full Report Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
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

          {/* Data Table with Thumbnail Photos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-black">
                  <th className="px-6 py-4 editorial-meta text-xs text-black">Evidence</th>
                  <th className="px-6 py-4 editorial-meta text-xs text-black">Report ID</th>
                  <th className="px-6 py-4 editorial-meta text-xs text-black">Location</th>
                  <th className="px-6 py-4 editorial-meta text-xs text-black">Classification</th>
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
                    <td className="px-6 py-4">
                      <div className="w-12 h-10 border border-black overflow-hidden bg-[#FAFAFA]">
                        <img 
                          src={complaint.photoUrl} 
                          alt={complaint.id} 
                          className="editorial-image w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-black">{complaint.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-black">{complaint.locationName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#525252]">{complaint.issueType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-black bg-white text-black">
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
      )}
    </div>
  );
};
