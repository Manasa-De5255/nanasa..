export type UserRole = 'super_admin' | 'admin' | 'professor' | 'student';

export type PortalTheme =
  | 'academic-blue'
  | 'elegant-cream'
  | 'ocean-breeze'
  | 'midnight-pro'
  | 'sage-ivory';

export type ThemeMode = 'light' | 'dark';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  department: string;
  permissions: string[];
  authorizedBy: string;
  authorizedAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'revoked';
  hasPasswordSet?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: 'SUPER_ADMIN_SETUP' | 'ADD_ADMIN' | 'UPDATE_CREDENTIALS' | 'REVOKE_ADMIN' | 'ADMIN_LOGIN';
  targetEmail: string;
  details: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  designation?: string;
  rollNo?: string;
  semester?: string;
  permissions?: string[];
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  department: string;
  category: 'Core' | 'Elective' | 'Lab' | 'Tutorial';
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  category: 'Grading' | 'Lecture Prep' | 'Department Meeting' | 'Mentorship' | 'Student Inquiry';
}

export interface Payslip {
  id: string;
  facultyId: string;
  facultyName: string;
  employeeId: string;
  month: string;
  year: number;
  basicPay: number;
  da: number;
  hra: number;
  allowances: number;
  pfDeduction: number;
  taxDeduction: number;
  netSalary: number;
  status: 'Disbursed' | 'Pending';
  disbursementDate: string;
  transactionRef: string;
}

export type RequestStatus = 'pending' | 'approved' | 'forwarded' | 'resolved' | 'closed';

export interface RequestTimelineEntry {
  step: string;
  date: string;
  actor: string;
  note?: string;
}

export interface RequestCase {
  id: string;
  ticketId: string;
  title: string;
  category: 'Infrastructure' | 'Curriculum' | 'Hostel & Dining' | 'Lab Facilities' | 'Library & Access' | 'Administrative';
  description: string;
  authorRole: 'Student' | 'Professor';
  authorName: string;
  isAnonymous: boolean;
  department: string;
  votes: number;
  userVoted: boolean;
  status: RequestStatus;
  date: string;
  escalatedTo?: string;
  timeline: RequestTimelineEntry[];
}

export interface CampusSpot {
  id: string;
  name: string;
  category: 'Study Haven' | 'Green Space' | 'Cafe & Snacks' | 'Innovation Lab' | 'Sports & Wellness';
  description: string;
  locationName: string;
  mapCoordinates: { lat: number; lng: number };
  votes: number;
  userVoted: boolean;
  bestTime: string;
}

export interface ExamEvent {
  id: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  semester: string;
  examDate: string;
  session: 'Morning (09:30 AM - 12:30 PM)' | 'Afternoon (02:00 PM - 05:00 PM)';
  hall: string;
  invigilator: string;
  maxMarks: number;
}

export interface AcademicUpdate {
  id: string;
  title: string;
  category: 'Notice' | 'Circular' | 'Event' | 'Urgent';
  date: string;
  author: string;
  summary: string;
  department: string;
}

export interface DepartmentContact {
  id: string;
  department: string;
  headName: string;
  email: string;
  phone: string;
  block: string;
  officeRoom: string;
  officeHours: string;
}
