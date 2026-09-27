import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Users,
  UserCog,
  Loader2,
  X,
} from 'lucide-react';
import { FakeCheckVerdict, Complaint, DuplicateCandidate } from '../../types';

// Quick-pick roster shown alongside the free-text field on the assignment
// panel. CivicLens has no staff-account system, so an assignment is just a
// plain-text name/crew stamped onto the report.
const MAINTENANCE_CREW = [
  'Electrical Crew A',
  'Electrical Crew B',
  'Pole Repair Unit',
  'On-Call Electrician',
];

const FAKE_CHECK_DISPLAY: Record<
  FakeCheckVerdict,
  { label: string; tone: 'ok' | 'warn' | 'unknown' }
> = {
  REAL_PHOTO: { label: 'Looks Like a Real Photo', tone: 'ok' },
  LIKELY_AI_GENERATED: { label: 'Likely AI-Generated', tone: 'warn' },
  LIKELY_MANIPULATED: { label: 'Likely Manipulated', tone: 'warn' },
  STOCK_OR_UNRELATED: { label: 'Stock / Unrelated Image', tone: 'warn' },
  UNCLEAR: { label: 'Unclear — Reviewed Manually', tone: 'unknown' },
};

export const ComplaintDetailsPage: React.FC = () => {
  const {
    selectedComplaint,
    complaints,
    confirmReportAction,
    navigateTo,
    loadGroupCandidates,
    loadGroupMembers,
    flagAsDuplicateOf,
    ungroupReport,
    assignToMaintenance,
  } = useApp();

  const complaint = selectedComplaint || complaints[0];

  const [isDuplicateConfirmed, setIsDuplicateConfirmed] = useState<boolean>(
    complaint?.confirmedAction === 'Confirmed Duplicate' || complaint?.status === 'Likely Duplicate'
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // --- Grouping (flag as duplicate of / group with another report) ---
  const [groupMembers, setGroupMembers] = useState<Complaint[]>([]);
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isGrouping, setIsGrouping] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // --- Assignment to a maintenance crew ---
  const [assigneeInput, setAssigneeInput] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const refreshGroupMembers = useCallback(async (id: string) => {
    try {
      const members = await loadGroupMembers(id);
      setGroupMembers(members.filter((m) => m.id !== id));
    } catch {
      setGroupMembers([]);
    }
  }, [loadGroupMembers]);

  useEffect(() => {
    if (!complaint) return;
    setCandidates(null);
    setSelectedCandidateId(null);
    setGroupError(null);
    setAssignError(null);
    setAssigneeInput(complaint.assignedTo || '');
    if (complaint.groupId) {
      refreshGroupMembers(complaint.id);
    } else {
      setGroupMembers([]);
    }
  }, [complaint?.id, complaint?.groupId, refreshGroupMembers]);

  if (!complaint) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10 text-center">
        <p className="editorial-meta text-black mb-4">No report selected</p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="inline-flex items-center gap-2 editorial-meta text-black hover:text-[#525252] transition-colors cursor-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const handleToggleConfirm = () => {
    if (isDuplicateConfirmed) {
      setIsDuplicateConfirmed(false);
      confirmReportAction(complaint.id, 'Kept Separate');
      setFeedbackMessage('Marked as Separate Fault. Crew dispatched independently.');
    } else {
      setIsDuplicateConfirmed(true);
      confirmReportAction(complaint.id, 'Confirmed Duplicate');
      setFeedbackMessage('Confirmed as Duplicate. Consolidated into main master ticket.');
    }
  };

  const handleFindNearby = async () => {
    setIsLoadingCandidates(true);
    setGroupError(null);
    try {
      const found = await loadGroupCandidates(complaint.id);
      setCandidates(found);
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Could not load nearby reports.');
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleFlagDuplicate = async () => {
    if (!selectedCandidateId) return;
    setIsGrouping(true);
    setGroupError(null);
    try {
      await flagAsDuplicateOf(complaint.id, selectedCandidateId);
      await refreshGroupMembers(complaint.id);
      setCandidates(null);
      setSelectedCandidateId(null);
      setFeedbackMessage(`Grouped with ${selectedCandidateId} as a duplicate report.`);
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Could not group these reports.');
    } finally {
      setIsGrouping(false);
    }
  };

  const handleUngroup = async () => {
    setIsGrouping(true);
    setGroupError(null);
    try {
      await ungroupReport(complaint.id);
      setGroupMembers([]);
      setFeedbackMessage('Removed from duplicate group. Now tracked as a separate fault.');
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Could not ungroup this report.');
    } finally {
      setIsGrouping(false);
    }
  };

  const handleAssign = async (name: string) => {
    const target = name.trim();
    if (!target) return;
    setIsAssigning(true);
    setAssignError(null);
    try {
      await assignToMaintenance(complaint.id, target);
      setAssigneeInput(target);
      setFeedbackMessage(`Assigned to ${target}.`);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Could not assign this report.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    setIsAssigning(true);
    setAssignError(null);
    try {
      await assignToMaintenance(complaint.id, null);
      setAssigneeInput('');
      setFeedbackMessage('Assignment cleared.');
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Could not clear this assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigateTo('dashboard')}
          className="inline-flex items-center gap-2 editorial-meta text-black hover:text-[#525252] transition-colors cursor-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="editorial-meta text-xs">
          Complaint Record {complaint.id}
        </span>
      </div>

      {/* Page Title */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl text-black uppercase tracking-[-0.05em]">
            Complaint Analysis
          </h1>
          <span className="px-3 py-1 border border-black text-xs font-mono uppercase bg-[#FAFAFA]">
            {complaint.id}
          </span>
        </div>
        <p className="text-[#525252] font-mono text-xs uppercase mt-2">
          {complaint.locationName} • Reported telemetry active
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Complaint Photo + Location Map */}
        <div className="space-y-8">
          
          {/* Complaint Photo */}
          <div className="bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <span className="editorial-meta text-xs block">
              Evidence Photo
            </span>
            <div className="relative h-72 border border-black overflow-hidden bg-[#FAFAFA]">
              <img
                src={complaint.photoUrl}
                alt="Complaint street view"
                className="editorial-image w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black text-white text-[10px] font-mono uppercase px-2.5 py-1 tracking-wider border border-white/20">
                {complaint.issueType}
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="editorial-meta text-xs block">
                Location Map
              </span>
              <span className="font-mono text-xs text-[#525252] uppercase">
                GPS: {complaint.coords?.lat || '19.0330'}, {complaint.coords?.lng || '73.0297'}
              </span>
            </div>

            <div className="relative h-52 border border-black bg-white overflow-hidden">
              <svg viewBox="0 0 500 220" className="w-full h-full object-cover">
                <rect width="500" height="220" fill="#FFFFFF" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#E5E5E5" strokeWidth="20" />
                <line x1="250" y1="0" x2="250" y2="220" stroke="#E5E5E5" strokeWidth="20" />
                <circle cx="250" cy="110" r="50" fill="rgba(0,0,0,0.05)" stroke="#000000" strokeWidth="1.5" strokeDasharray="4,4" />
              </svg>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-md border-2 border-white">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 bg-white border border-black px-2 py-1 text-[10px] text-black font-mono uppercase">
                {complaint.locationName}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          
          <div className="flex items-center gap-2 pb-4 border-b border-black">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="font-bold text-xl text-black uppercase tracking-tight">
              AI Telemetry Analysis
            </h2>
          </div>

          <div className="space-y-4">
            <span className="editorial-meta text-xs block">
              Triangulation Factors
            </span>

            {/* Factor 1 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 1</span>
                <span className="text-sm font-bold text-black">Image Similarity</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.imageSimilarityPercent || 90}%
              </span>
            </div>

            {/* Factor 2 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 2</span>
                <span className="text-sm font-bold text-black">Location Proximity</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.proximityMeters || 15} m
              </span>
            </div>

            {/* Factor 3 */}
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Factor 3</span>
                <span className="text-sm font-bold text-black">Complaint Density</span>
              </div>
              <span className="font-mono text-2xl font-bold text-black">
                {complaint.factors?.complaintDensityCount || 1} reports
              </span>
            </div>
          </div>

          {/* AI Result Block */}
          <div className="p-5 bg-[#FAFAFA] border border-black space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-black bg-black text-white">
                AI Result
              </span>
              <span className="font-bold text-base text-black uppercase">
                {complaint.aiResult || complaint.status}
              </span>
            </div>
            <p className="text-sm text-[#525252] leading-relaxed">
              “{complaint.aiExplanation || complaint.description}”
            </p>
          </div>

          {/* Image Authenticity Block */}
          {complaint.fakeCheck && (() => {
            const display = FAKE_CHECK_DISPLAY[complaint.fakeCheck.verdict] || FAKE_CHECK_DISPLAY.UNCLEAR;
            const Icon = display.tone === 'ok' ? ShieldCheck : display.tone === 'warn' ? ShieldAlert : ShieldQuestion;
            const toneClasses =
              display.tone === 'warn'
                ? 'border-red-600 bg-red-50'
                : display.tone === 'ok'
                ? 'border-black bg-[#FAFAFA]'
                : 'border-black/30 bg-[#FAFAFA]';
            return (
              <div className={`p-5 border space-y-2 ${toneClasses}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 shrink-0 ${display.tone === 'warn' ? 'text-red-600' : 'text-black'}`} />
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-black bg-black text-white">
                    Image Authenticity
                  </span>
                  <span className={`font-bold text-base uppercase ${display.tone === 'warn' ? 'text-red-700' : 'text-black'}`}>
                    {display.label}
                  </span>
                  {complaint.fakeCheck.confidence > 0 && (
                    <span className="font-mono text-xs text-[#737373] ml-auto">
                      {complaint.fakeCheck.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#525252] leading-relaxed">
                  {complaint.fakeCheck.reason}
                </p>
              </div>
            );
          })()}

          {feedbackMessage && (
            <div className="p-3 bg-white border border-black text-xs font-mono uppercase text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleToggleConfirm}
              className="w-full py-4 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isDuplicateConfirmed ? 'Confirm Duplicate (Click to Keep Separate)' : 'Keep Separate (Click to Confirm Duplicate)'}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Verification & Dispatch — authority review actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-8">

        {/* Group / Flag Duplicate Panel */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-black">
            <Users className="w-5 h-5 text-black" />
            <h2 className="font-bold text-xl text-black uppercase tracking-tight">
              Group Duplicate Reports
            </h2>
          </div>

          {complaint.groupId && (
            <div className="p-4 bg-[#FAFAFA] border border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="editorial-meta text-[10px]">
                  Grouped under {complaint.groupId}
                </span>
                <button
                  onClick={handleUngroup}
                  disabled={isGrouping}
                  className="text-[10px] font-bold uppercase tracking-wider text-black hover:text-[#525252] underline cursor-none disabled:opacity-50"
                >
                  Ungroup
                </button>
              </div>
              {groupMembers.length > 0 ? (
                <ul className="space-y-1.5">
                  {groupMembers.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-xs font-mono">
                      <button
                        onClick={() => navigateTo('details', m.id)}
                        className="font-bold text-black hover:underline cursor-none"
                      >
                        {m.id}
                      </button>
                      <span className="text-[#737373] uppercase truncate ml-3">{m.locationName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#737373] font-mono">No other reports in this group yet.</p>
              )}
            </div>
          )}

          <div>
            <button
              onClick={handleFindNearby}
              disabled={isLoadingCandidates}
              className="w-full py-3 bg-white hover:bg-[#FAFAFA] text-black border border-black font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none disabled:opacity-50"
            >
              {isLoadingCandidates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              <span>Find Nearby Reports to Group</span>
            </button>
          </div>

          {candidates !== null && (
            <div className="space-y-3">
              {candidates.length === 0 ? (
                <p className="text-xs text-[#737373] font-mono uppercase text-center py-4">
                  No other reports found within range of this location.
                </p>
              ) : (
                <div className="border border-black divide-y divide-black/10 max-h-64 overflow-y-auto">
                  {candidates.map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        selectedCandidateId === c.id ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="group-candidate"
                        checked={selectedCandidateId === c.id}
                        onChange={() => setSelectedCandidateId(c.id)}
                        className="cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-black">{c.id}</span>
                          <span className="text-[10px] text-[#737373] uppercase truncate">{c.locationName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-[#737373] uppercase">
                          <span>{c.imageSimilarityPercent}% photo match</span>
                          <span>{c.proximityMeters}m away</span>
                          <span>{c.status}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {candidates.length > 0 && (
                <button
                  onClick={handleFlagDuplicate}
                  disabled={!selectedCandidateId || isGrouping}
                  className="w-full py-4 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none disabled:opacity-50"
                >
                  {isGrouping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Flag as Duplicate & Group</span>
                </button>
              )}
            </div>
          )}

          {groupError && (
            <div className="p-3 bg-red-50 border border-red-600 text-xs font-mono uppercase text-red-700 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{groupError}</span>
            </div>
          )}
        </div>

        {/* Assign to Maintenance Panel */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-black">
            <UserCog className="w-5 h-5 text-black" />
            <h2 className="font-bold text-xl text-black uppercase tracking-tight">
              Dispatch to Maintenance
            </h2>
          </div>

          {complaint.assignedTo ? (
            <div className="p-4 bg-[#FAFAFA] border border-black flex items-center justify-between">
              <div>
                <span className="editorial-meta text-[10px] block mb-1">Currently Assigned</span>
                <span className="text-sm font-bold text-black">{complaint.assignedTo}</span>
              </div>
              <button
                onClick={handleUnassign}
                disabled={isAssigning}
                className="text-[10px] font-bold uppercase tracking-wider text-black hover:text-[#525252] underline cursor-none disabled:opacity-50"
              >
                Unassign
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#737373] font-mono uppercase">
              Not yet dispatched to a crew.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {MAINTENANCE_CREW.map((name) => (
              <button
                key={name}
                onClick={() => handleAssign(name)}
                disabled={isAssigning}
                className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-none disabled:opacity-50 ${
                  complaint.assignedTo === name
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black/20 hover:border-black'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              placeholder="Or enter a name / crew..."
              className="flex-1 px-4 py-3 bg-white border border-black text-sm text-black placeholder:text-[#737373] focus:outline-none cursor-none"
            />
            <button
              onClick={() => handleAssign(assigneeInput)}
              disabled={isAssigning || !assigneeInput.trim()}
              className="px-6 py-3 bg-black hover:bg-[#525252] text-white font-bold text-xs uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 cursor-none disabled:opacity-50"
            >
              {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
              <span>Assign</span>
            </button>
          </div>

          {assignError && (
            <div className="p-3 bg-red-50 border border-red-600 text-xs font-mono uppercase text-red-700 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{assignError}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
