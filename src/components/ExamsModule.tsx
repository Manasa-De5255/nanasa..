import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { initialExams, initialUpdates } from '../data/mockData.ts';
import { ExamEvent, AcademicUpdate } from '../types/index.ts';
import {
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Bell,
  Search,
  Plus,
  BookOpen,
  Filter
} from 'lucide-react';

export const ExamsModule: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamEvent[]>(initialExams);
  const [updates, setUpdates] = useState<AcademicUpdate[]>(initialUpdates);
  const [activeTab, setActiveTab] = useState<'calendar' | 'updates'>('calendar');
  const [examSearch, setExamSearch] = useState('');

  // Add exam modal for admin
  const [showAddExam, setShowAddExam] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [examDate, setExamDate] = useState('2026-05-25');
  const [examHall, setExamHall] = useState('Hall B-204');
  const [invigilator, setInvigilator] = useState('Dr. Vikram Sharma');
  const [session, setSession] = useState<ExamEvent['session']>('Morning (09:30 AM - 12:30 PM)');

  // Post update modal for admin
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [upTitle, setUpTitle] = useState('');
  const [upCategory, setUpCategory] = useState<AcademicUpdate['category']>('Circular');
  const [upSummary, setUpSummary] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim()) return;

    const newExam: ExamEvent = {
      id: 'ex-' + Date.now(),
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      department: 'Computer Science & Engineering',
      semester: 'Semester 8',
      examDate,
      session,
      hall: examHall,
      invigilator,
      maxMarks: 100,
    };

    setExams([...exams, newExam]);
    setShowAddExam(false);
    setCourseCode('');
    setCourseTitle('');
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upTitle.trim() || !upSummary.trim()) return;

    const newUp: AcademicUpdate = {
      id: 'up-' + Date.now(),
      title: upTitle.trim(),
      category: upCategory,
      date: new Date().toISOString().split('T')[0],
      author: user?.name || 'Academic Administration',
      summary: upSummary.trim(),
      department: user?.department || 'Dean Office',
    };

    setUpdates([newUp, ...updates]);
    setShowAddUpdate(false);
    setUpTitle('');
    setUpSummary('');
  };

  const filteredExams = exams.filter((ex) => {
    const q = examSearch.toLowerCase();
    return (
      ex.courseCode.toLowerCase().includes(q) ||
      ex.courseTitle.toLowerCase().includes(q) ||
      ex.hall.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Examinations Wing & Academic Bulletins
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Spring 2026 End-Semester schedule, hall allocations, and official chancellor circulars.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAddExam(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </button>
            <button
              onClick={() => setShowAddUpdate(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-subtle text-main border border-subtle hover:bg-surface transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-brand" />
              <span>Post Circular</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-subtle pb-3">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-1 transition-colors cursor-pointer ${
              activeTab === 'calendar' ? 'text-brand border-b-2 border-brand font-bold' : 'text-muted-custom hover:text-main'
            }`}
          >
            End-Semester Exam Schedule ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`py-1 transition-colors cursor-pointer ${
              activeTab === 'updates' ? 'text-brand border-b-2 border-brand font-bold' : 'text-muted-custom hover:text-main'
            }`}
          >
            Academic Notices & Circulars ({updates.length})
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-muted-custom absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Search code or subject..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main placeholder:text-muted-custom/60 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Examination Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-subtle bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle/60 border-b border-subtle text-muted-custom uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Course Details</th>
                  <th className="py-3 px-4">Examination Hall</th>
                  <th className="py-3 px-4">Invigilator</th>
                  <th className="py-3 px-4 text-right">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredExams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-subtle/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-main font-mono">{ex.examDate}</div>
                      <div className="text-[11px] text-muted-custom flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{ex.session}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10">
                          {ex.courseCode}
                        </span>
                        <span className="font-semibold text-main">{ex.courseTitle}</span>
                      </div>
                      <div className="text-[10px] text-muted-custom mt-0.5">
                        {ex.department} · {ex.semester}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-custom">
                      <div className="flex items-center gap-1 text-main font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand" />
                        <span>{ex.hall}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-custom font-medium">
                      {ex.invigilator}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-main tabular-nums">
                      {ex.maxMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Academic Updates Feed */}
      {activeTab === 'updates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {updates.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-subtle bg-surface hover:border-brand/40 transition-all space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.category === 'Urgent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                      : item.category === 'Notice'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-[11px] font-mono text-muted-custom">{item.date}</span>
              </div>

              <h3 className="text-sm font-bold text-main leading-snug">{item.title}</h3>

              <p className="text-xs text-muted-custom leading-relaxed">{item.summary}</p>

              <div className="pt-2 border-t border-subtle flex items-center justify-between text-[11px] text-muted-custom">
                <span>By: {item.author}</span>
                <span>{item.department}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-subtle shadow-2xl p-6 space-y-4 text-main">
            <h3 className="text-base font-bold text-main">Schedule End-Semester Exam</h3>
            <form onSubmit={handleAddExam} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required
                    placeholder="e.g. CS490"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  placeholder="e.g. Machine Learning Systems"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Session</label>
                <select
                  value={session}
                  onChange={(e: any) => setSession(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                >
                  <option value="Morning (09:30 AM - 12:30 PM)">Morning (09:30 AM - 12:30 PM)</option>
                  <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Hall</label>
                  <input
                    type="text"
                    value={examHall}
                    onChange={(e) => setExamHall(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Invigilator</label>
                  <input
                    type="text"
                    value={invigilator}
                    onChange={(e) => setInvigilator(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExam(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-subtle text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90"
                >
                  Confirm Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Circular Modal */}
      {showAddUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-subtle shadow-2xl p-6 space-y-4 text-main">
            <h3 className="text-base font-bold text-main">Publish Academic Circular</h3>
            <form onSubmit={handleAddUpdate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Circular Title</label>
                <input
                  type="text"
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  required
                  placeholder="e.g. Schedule Revision for Supplementary Labs"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Category</label>
                <select
                  value={upCategory}
                  onChange={(e: any) => setUpCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                >
                  <option value="Notice">Notice</option>
                  <option value="Circular">Circular</option>
                  <option value="Urgent">Urgent Alert</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Summary & Instructions</label>
                <textarea
                  value={upSummary}
                  onChange={(e) => setUpSummary(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUpdate(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-subtle text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
