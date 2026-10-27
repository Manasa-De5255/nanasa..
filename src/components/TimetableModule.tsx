import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { initialTimetable, initialTasks } from '../data/mockData.ts';
import { TimetableEntry, TaskItem } from '../types/index.ts';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Tag,
  BookOpen,
  Filter,
  CheckSquare
} from 'lucide-react';

export const TimetableModule: React.FC = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-05-04');
  const [newTaskCategory, setNewTaskCategory] = useState<'Grading' | 'Lecture Prep' | 'Department Meeting' | 'Mentorship' | 'Student Inquiry'>('Lecture Prep');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // New timetable slot modal for admins
  const [showAddClass, setShowAddClass] = useState(false);
  const [newSubj, setNewSubj] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newFaculty, setNewFaculty] = useState('Dr. Vikram Sharma');
  const [newRoom, setNewRoom] = useState('Hall B-204');
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [newTime, setNewTime] = useState('02:30 PM - 03:45 PM');
  const [newClassCat, setNewClassCat] = useState<'Core' | 'Elective' | 'Lab' | 'Tutorial'>('Core');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const categories = ['All', 'Core', 'Lab', 'Elective', 'Tutorial'];

  const filteredSchedule = timetable.filter((item) => {
    const matchDay = selectedDay === 'All' || item.day === selectedDay;
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchDay && matchCat;
  });

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: 'tsk-' + Date.now(),
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      completed: false,
      category: newTaskCategory,
    };

    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    setShowTaskForm(false);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj.trim() || !newCode.trim()) return;

    const entry: TimetableEntry = {
      id: 'tt-' + Date.now(),
      day: newDay,
      period: timetable.filter((t) => t.day === newDay).length + 1,
      time: newTime,
      subject: newSubj.trim(),
      code: newCode.trim(),
      faculty: newFaculty,
      room: newRoom,
      department: 'Computer Science & Engineering',
      category: newClassCat,
    };

    setTimetable([...timetable, entry]);
    setShowAddClass(false);
    setNewSubj('');
    setNewCode('');
  };

  const canEditSchedule = user?.role === 'admin' || user?.role === 'super_admin';
  const isProfessor = user?.role === 'professor';

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Academic Timetable & Daily Schedule
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Spring 2026 Semester · Department of Computer Science & Allied Disciplines
          </p>
        </div>

        {canEditSchedule && (
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-contrast hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timetable Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Day & Category Filters */}
          <div className="space-y-3 p-4 rounded-xl bg-surface border border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-custom uppercase tracking-wider">
                Select Day
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-custom">
                <Filter className="w-3.5 h-3.5" />
                <span>Class Filter</span>
              </div>
            </div>

            {/* Day Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDay === day
                      ? 'bg-brand text-brand-contrast shadow-2xs'
                      : 'bg-subtle text-muted-custom hover:text-main'
                  }`}
                >
                  {day}
                </button>
              ))}
              <button
                onClick={() => setSelectedDay('All')}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDay === 'All'
                    ? 'bg-brand text-brand-contrast shadow-2xs'
                    : 'bg-subtle text-muted-custom hover:text-main'
                }`}
              >
                All Days
              </button>
            </div>

            {/* Category Segmented Selector */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-subtle text-xs">
              <span className="text-[11px] text-muted-custom mr-1">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand/15 text-brand font-bold'
                      : 'text-muted-custom hover:text-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Timetable Cards */}
          <div className="space-y-3">
            {filteredSchedule.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-subtle bg-surface text-muted-custom text-xs">
                No scheduled lectures or labs found for the selected filter.
              </div>
            ) : (
              filteredSchedule.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-subtle bg-surface hover:bg-subtle/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand px-2 py-0.5 rounded bg-brand/10">
                        {item.code}
                      </span>
                      <h3 className="text-sm font-bold text-main">{item.subject}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-subtle text-muted-custom border border-subtle">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-custom pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {item.faculty}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.room}
                      </span>
                      <span className="text-xs">· {item.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-subtle border border-subtle text-xs font-mono font-medium text-main">
                      <Clock className="w-3.5 h-3.5 text-muted-custom" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Daily Tasks (Editable for Faculty & Students) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-subtle bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-main">
                  {isProfessor ? 'Professor Daily Planner' : 'Academic Action Items'}
                </h2>
              </div>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="text-xs font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showTaskForm ? 'Cancel' : 'New Task'}</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {showTaskForm && (
              <form onSubmit={handleAddTask} className="p-3 rounded-xl bg-subtle space-y-2.5 border border-subtle">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-main">Task Title</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    placeholder="e.g. Upload lab worksheet for CS401"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-subtle bg-surface text-main focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-main">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e: any) => setNewTaskPriority(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-subtle bg-surface text-main"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-main">Due Date</label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-subtle bg-surface text-main"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90 cursor-pointer"
                >
                  Save Task
                </button>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    task.completed
                      ? 'border-subtle bg-subtle/40 opacity-70'
                      : 'border-subtle bg-surface hover:border-brand/40 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-brand shrink-0 cursor-pointer"
                    aria-label="Toggle task status"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-custom" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        task.completed ? 'line-through text-muted-custom' : 'text-main'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-muted-custom">
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded ${
                          task.priority === 'High'
                            ? 'text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300'
                            : task.priority === 'Medium'
                            ? 'text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300'
                            : 'text-slate-600 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span>Due {task.dueDate}</span>
                      <span>· {task.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Class Modal for Admins */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-subtle shadow-2xl p-6 space-y-4 text-main">
            <h3 className="text-base font-bold text-main">Add New Timetable Slot</h3>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Course Name</label>
                <input
                  type="text"
                  value={newSubj}
                  onChange={(e) => setNewSubj(e.target.value)}
                  required
                  placeholder="e.g. Real-Time Embedded Systems"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Course Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    placeholder="e.g. CS420"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Category</label>
                  <select
                    value={newClassCat}
                    onChange={(e: any) => setNewClassCat(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Day</label>
                  <select
                    value={newDay}
                    onChange={(e: any) => setNewDay(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-main">Room / Lab</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-subtle text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
