import React from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext.tsx';
import { initialTimetable, initialTasks, initialExams, initialUpdates, initialSpots, initialPayslips, initialRequests } from '../data/mockData.ts';
import {
  Calendar,
  Clock,
  FileCheck2,
  MessageSquare,
  Compass,
  FileText,
  ShieldCheck,
  ArrowRight,
  User,
  Sparkles,
  CheckCircle2,
  MapPin,
  Bell
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  onOpenVoiceAI: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onOpenVoiceAI }) => {
  const { user, adminsList, auditLogs } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isProfessor = user?.role === 'professor';
  const isStudent = user?.role === 'student';

  const todaysClasses = initialTimetable.filter((t) => t.day === 'Monday');
  const pendingRequests = initialRequests.filter((r) => r.status === 'pending');
  const topSpot = [...initialSpots].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="space-y-6">
      {/* Welcome & Role Card */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="uppercase tracking-wider">Unicore Academic Portal</span>
            <span>·</span>
            <span>Spring 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-main">
            Welcome back, {user?.name || 'Scholar'}
          </h1>

          <p className="text-xs sm:text-sm text-muted-custom max-w-xl">
            {isSuperAdmin &&
              `Super Admin authorization active for ${SUPER_ADMIN_EMAIL}. Full administrative oversight and credential management enabled.`}
            {isAdmin && !isSuperAdmin &&
              `Authorized Administrator for ${user?.department || 'Academic Affairs'}. Exam schedules, circular broadcasts, and request escalation active.`}
            {isProfessor &&
              `${user?.designation || 'Associate Professor'} · ${user?.department || 'Computer Science'}. Daily instructional planner and monthly compensation portal ready.`}
            {isStudent &&
              `${user?.semester || 'Semester 4'} · ${user?.department || 'Computer Science'}. Track your weekly lecture slots, cast votes on campus spaces, and voice your feedback.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <button
            onClick={onOpenVoiceAI}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand text-brand-contrast hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Voice Assistant (Mitra)</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => onNavigate('security')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-subtle text-main border border-subtle hover:bg-surface transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Admin Management</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigate('timetable')}
          className="p-4 rounded-xl border border-subtle bg-surface hover:border-brand/40 transition-all cursor-pointer space-y-1 shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-custom">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Today's Schedule
            </span>
            <Calendar className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold font-mono text-main">
            {todaysClasses.length} Slots
          </div>
          <span className="text-[10px] text-muted-custom">
            Monday · Hall B-204 & Lab Alpha
          </span>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigate('exams')}
          className="p-4 rounded-xl border border-subtle bg-surface hover:border-brand/40 transition-all cursor-pointer space-y-1 shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-custom">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Next Examination
            </span>
            <FileCheck2 className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold font-mono text-main">
            May 10
          </div>
          <span className="text-[10px] text-muted-custom">
            CS401 Distributed Systems
          </span>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigate('requests')}
          className="p-4 rounded-xl border border-subtle bg-surface hover:border-brand/40 transition-all cursor-pointer space-y-1 shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-custom">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pending Requests
            </span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingRequests.length} Cases
          </div>
          <span className="text-[10px] text-muted-custom">
            Awaiting Committee Review
          </span>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigate(isSuperAdmin ? 'security' : isProfessor ? 'payslips' : 'spots')}
          className="p-4 rounded-xl border border-subtle bg-surface hover:border-brand/40 transition-all cursor-pointer space-y-1 shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-custom">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {isSuperAdmin ? 'Authorized Admins' : isProfessor ? 'Net Monthly Salary' : 'Top Campus Spot'}
            </span>
            {isSuperAdmin ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : isProfessor ? (
              <FileText className="w-4 h-4 text-emerald-600" />
            ) : (
              <Compass className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-main">
            {isSuperAdmin
              ? `${adminsList.length} Accounts`
              : isProfessor
              ? `₹${(initialPayslips[0].netSalary / 1000).toFixed(1)}k`
              : `${topSpot.votes} Votes`}
          </div>
          <span className="text-[10px] text-muted-custom truncate block">
            {isSuperAdmin
              ? 'Institutional Security Verified'
              : isProfessor
              ? 'April 2026 Disbursed'
              : topSpot.name}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Schedule Preview & Recent Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Today's Classes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-subtle bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-main">Today's Class Schedule (Monday)</h2>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todaysClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-subtle bg-subtle/30 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand px-1.5 py-0.2 rounded bg-brand/10">
                        {item.code}
                      </span>
                      <h3 className="text-xs font-bold text-main">{item.subject}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-custom">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.room}
                      </span>
                      <span>· {item.faculty}</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-md bg-surface border border-subtle text-xs font-mono font-medium text-main shrink-0">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Academic Circulars Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-subtle bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-main">Official Bulletins</h2>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {initialUpdates.slice(0, 3).map((up) => (
                <div
                  key={up.id}
                  className="p-3 rounded-xl border border-subtle bg-subtle/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                        up.category === 'Urgent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      }`}
                    >
                      {up.category}
                    </span>
                    <span className="text-[10px] font-mono text-muted-custom">{up.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-main leading-snug">{up.title}</h3>
                  <p className="text-[11px] text-muted-custom line-clamp-2">{up.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
