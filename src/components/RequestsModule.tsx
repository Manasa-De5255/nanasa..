import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { initialRequests } from '../data/mockData.ts';
import { RequestCase, RequestStatus } from '../types/index.ts';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Send,
  EyeOff,
  User,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const RequestsModule: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestCase[]>(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // New Request Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RequestCase['category']>('Infrastructure');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const toggleVote = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newVoteState = !r.userVoted;
          const newVotes = newVoteState ? r.votes + 1 : Math.max(0, r.votes - 1);
          // If votes reach threshold, auto-escalate if pending
          let updatedStatus = r.status;
          let timeline = [...r.timeline];
          if (newVotes >= 25 && r.status === 'pending') {
            updatedStatus = 'forwarded';
            timeline.push({
              step: 'Auto-escalated to Dean of Student Affairs via community endorsement',
              date: new Date().toISOString().split('T')[0],
              actor: 'Campus Community Engine',
            });
          }
          return {
            ...r,
            votes: newVotes,
            userVoted: newVoteState,
            status: updatedStatus,
            timeline,
          };
        }
        return r;
      })
    );
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const authorRole = user?.role === 'professor' ? 'Professor' : 'Student';
    const authorName = isAnonymous
      ? 'Anonymous ' + authorRole
      : user?.name || 'Campus Member';

    const newCase: RequestCase = {
      id: 'req-' + Date.now(),
      ticketId: `UC-REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category,
      description: description.trim(),
      authorRole,
      authorName,
      isAnonymous,
      department: user?.department || 'General Campus',
      votes: 1,
      userVoted: true,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      timeline: [
        {
          step: isAnonymous ? 'Filed anonymously in campus forum' : `Submitted by ${authorName}`,
          date: new Date().toISOString().split('T')[0],
          actor: authorName,
        },
      ],
    };

    setRequests([newCase, ...requests]);
    setTitle('');
    setDescription('');
    setIsAnonymous(false);
    setShowForm(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3500);
  };

  const handleAdminStatusChange = (id: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const timeline = [
            ...r.timeline,
            {
              step: `Status updated to ${newStatus.toUpperCase()}`,
              date: new Date().toISOString().split('T')[0],
              actor: user?.name || 'Administrator',
            },
          ];
          return { ...r, status: newStatus, timeline };
        }
        return r;
      })
    );
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchStatus && matchCat;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="status-pending px-2.5 py-0.5 rounded text-[11px] font-semibold">Pending</span>;
      case 'approved':
        return <span className="status-approved px-2.5 py-0.5 rounded text-[11px] font-semibold">Approved</span>;
      case 'forwarded':
        return <span className="status-forwarded px-2.5 py-0.5 rounded text-[11px] font-semibold">Forwarded</span>;
      case 'resolved':
        return <span className="status-resolved px-2.5 py-0.5 rounded text-[11px] font-semibold">Resolved</span>;
      case 'closed':
        return <span className="status-closed px-2.5 py-0.5 rounded text-[11px] font-semibold">Closed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Student & Faculty Request Box
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Public & anonymous grievance resolution, peer endorsement voting, and multi-tier administrative escalation.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Proposal' : 'Submit Campus Request'}</span>
        </button>
      </div>

      {formSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your request has been published and logged into the campus grievance ledger.</span>
        </div>
      )}

      {/* New Request Creation Form */}
      {showForm && (
        <div className="rounded-2xl border border-subtle bg-surface p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-subtle pb-3">
            <h2 className="text-sm font-bold text-main">Create New Campus Request or Grievance</h2>
            <span className="text-xs text-muted-custom">All requests receive committee review</span>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-main">Request Title / Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Request for additional high-speed Wi-Fi routers in Turing Block"
                className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Lab Facilities">Lab Facilities</option>
                  <option value="Curriculum">Curriculum</option>
                  <option value="Library & Access">Library & Access</option>
                  <option value="Hostel & Dining">Hostel & Dining</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-main cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <EyeOff className="w-4 h-4 text-muted-custom" />
                  <span>Submit Anonymously (Hide My Name & ID)</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-main">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe the issue, location, impact on students/faculty, and proposed solution..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-subtle text-main"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Forum</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-subtle text-xs">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'approved', 'forwarded', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-brand text-brand-contrast'
                  : 'bg-subtle text-muted-custom hover:text-main'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-muted-custom text-[11px] shrink-0">Topic:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
          >
            <option value="all">All Topics</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Lab Facilities">Lab Facilities</option>
            <option value="Library & Access">Library & Access</option>
            <option value="Hostel & Dining">Hostel & Dining</option>
          </select>
        </div>
      </div>

      {/* Request Cases List */}
      <div className="space-y-3">
        {filteredRequests.map((c) => {
          const isExpanded = expandedCaseId === c.id;
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-subtle bg-surface p-5 space-y-3 hover:border-brand/30 transition-all shadow-2xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-custom">{c.ticketId}</span>
                    <span className="text-xs text-muted-custom">·</span>
                    <span className="text-xs font-semibold text-brand">{c.category}</span>
                    <span className="text-xs text-muted-custom">·</span>
                    <span className="text-xs text-muted-custom">{c.department}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-main leading-snug">
                    {c.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {getStatusBadge(c.status)}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-custom leading-relaxed">
                {c.description}
              </p>

              {/* Actions & Metadata Row */}
              <div className="pt-2 border-t border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-muted-custom text-[11px]">
                  <span className="flex items-center gap-1">
                    {c.isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span>{c.authorName}</span>
                  </span>
                  <span>·</span>
                  <span>Filed {c.date}</span>
                  {c.escalatedTo && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        Escalated: {c.escalatedTo}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Upvote Button */}
                  <button
                    onClick={() => toggleVote(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      c.userVoted
                        ? 'bg-brand text-brand-contrast shadow-xs'
                        : 'bg-subtle text-main hover:bg-surface border border-subtle'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{c.votes} Endorsements</span>
                  </button>

                  {/* Toggle Timeline */}
                  <button
                    onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-custom hover:text-main bg-subtle/50 hover:bg-subtle cursor-pointer"
                  >
                    <span>Timeline ({c.timeline.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Timeline & Admin Actions */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-subtle space-y-3 bg-subtle/40 p-3.5 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-main">
                    Case Lifecycle & Action Audit
                  </h4>

                  <div className="space-y-2 border-l-2 border-brand/30 pl-3 ml-1 text-xs">
                    {c.timeline.map((step, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-semibold text-main">{step.step}</div>
                        <div className="text-[10px] text-muted-custom font-mono">
                          {step.date} · By {step.actor}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Fast Actions */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-subtle flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-main">Admin Triage:</span>
                      <button
                        onClick={() => handleAdminStatusChange(c.id, 'approved')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAdminStatusChange(c.id, 'forwarded')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 cursor-pointer"
                      >
                        Forward
                      </button>
                      <button
                        onClick={() => handleAdminStatusChange(c.id, 'resolved')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleAdminStatusChange(c.id, 'closed')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
