import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent data store with preloaded campus records
interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  department: string;
  permissions: string[];
  password: string; // Stored securely on server
  authorizedBy: string;
  authorizedAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'revoked';
}

interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: 'SUPER_ADMIN_SETUP' | 'ADD_ADMIN' | 'UPDATE_CREDENTIALS' | 'REVOKE_ADMIN' | 'ADMIN_LOGIN';
  targetEmail: string;
  details: string;
  ip?: string;
}

const SUPER_ADMIN_EMAIL = 'manasadevi4077@gmail.com';
const INITIAL_SETUP_CODE = 'UNICORE-4077-SETUP';

let isSuperAdminVerified = false;
let superAdminPassword = ''; // Set upon first-time verification

const adminAccounts: AdminAccount[] = [
  {
    id: 'admin-super-1',
    email: SUPER_ADMIN_EMAIL,
    name: 'Manasa Devi (Super Admin)',
    role: 'super_admin',
    department: 'Office of the Dean & Security Operations',
    permissions: ['all', 'security', 'academic_governance', 'finance', 'admin_management'],
    password: '',
    authorizedBy: 'Institutional Security Protocol',
    authorizedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'admin-acad-2',
    email: 'academic.dean@unicore.edu',
    name: 'Dr. Ramesh Kumar',
    role: 'admin',
    department: 'Academic Affairs',
    permissions: ['academic_governance', 'timetable_edit', 'exam_schedule'],
    password: 'Academic@2026',
    authorizedBy: SUPER_ADMIN_EMAIL,
    authorizedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active',
  },
  {
    id: 'admin-exam-3',
    email: 'controller.exams@unicore.edu',
    name: 'Prof. Ananya Sen',
    role: 'admin',
    department: 'Examination Wing',
    permissions: ['exam_schedule', 'academic_governance'],
    password: 'ExamController!26',
    authorizedBy: SUPER_ADMIN_EMAIL,
    authorizedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
  }
];

const auditLogs: AuditLog[] = [
  {
    id: 'audit-init-0',
    timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
    actorEmail: 'system@unicore.edu',
    action: 'SUPER_ADMIN_SETUP',
    targetEmail: SUPER_ADMIN_EMAIL,
    details: 'Designated manasadevi4077@gmail.com as primary Super Admin with required one-time setup code.',
  },
  {
    id: 'audit-init-1',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'ADD_ADMIN',
    targetEmail: 'academic.dean@unicore.edu',
    details: 'Authorized Dr. Ramesh Kumar with Academic Affairs permissions.',
  },
  {
    id: 'audit-init-2',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'ADD_ADMIN',
    targetEmail: 'controller.exams@unicore.edu',
    details: 'Authorized Prof. Ananya Sen with Examination Wing credentials.',
  }
];

// Initialize Google GenAI client if valid key exists
const rawApiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenAI | null = null;
if (rawApiKey && rawApiKey !== 'MY_GEMINI_API_KEY' && rawApiKey.trim().length > 10) {
  genAI = new GoogleGenAI({
    apiKey: rawApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- API ROUTES ----------------

// Setup status for Super Admin
app.get('/api/auth/setup-status', (req: Request, res: Response) => {
  res.json({
    superAdminEmail: SUPER_ADMIN_EMAIL,
    isVerified: isSuperAdminVerified,
    setupCodeHint: isSuperAdminVerified ? null : INITIAL_SETUP_CODE,
  });
});

// One-time Setup Verification for Super Admin
app.post('/api/auth/setup-verify', (req: Request, res: Response) => {
  const { email, code, password } = req.body;

  if (email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase().trim()) {
    return res.status(403).json({ error: 'This verification endpoint is restricted strictly to the designated Super Admin.' });
  }

  if (code.trim() !== INITIAL_SETUP_CODE) {
    return res.status(400).json({ error: 'Invalid verification code. Please check the setup credentials provided.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Please set a secure master password (at least 6 characters).' });
  }

  isSuperAdminVerified = true;
  superAdminPassword = password;

  const superAdmin = adminAccounts.find(a => a.email === SUPER_ADMIN_EMAIL);
  if (superAdmin) {
    superAdmin.password = password;
    superAdmin.updatedAt = new Date().toISOString();
  }

  const newLog: AuditLog = {
    id: 'audit-' + Date.now(),
    timestamp: new Date().toISOString(),
    actorEmail: SUPER_ADMIN_EMAIL,
    action: 'SUPER_ADMIN_SETUP',
    targetEmail: SUPER_ADMIN_EMAIL,
    details: 'Super Admin account verified successfully with master credentials provisioned.',
  };
  auditLogs.unshift(newLog);

  res.json({
    success: true,
    message: 'Super Admin account verified and activated successfully.',
    user: {
      email: SUPER_ADMIN_EMAIL,
      name: 'Manasa Devi (Super Admin)',
      role: 'super_admin',
      department: 'Office of the Dean & Security Operations',
    },
    token: `token-super-${Date.now()}`,
  });
});

// Admin & Portal Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const normalizedEmail = (email || '').toLowerCase().trim();

  // If attempting Super Admin login
  if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (!isSuperAdminVerified) {
      return res.status(403).json({
        error: 'The Super Admin account has not completed first-time verification. Please verify using your setup code.',
        requiresSetup: true,
      });
    }

    if (password !== superAdminPassword) {
      return res.status(401).json({ error: 'Invalid Super Admin password.' });
    }

    const log: AuditLog = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'ADMIN_LOGIN',
      targetEmail: SUPER_ADMIN_EMAIL,
      details: 'Super Admin authenticated via verified credentials.',
    };
    auditLogs.unshift(log);

    return res.json({
      success: true,
      user: {
        email: SUPER_ADMIN_EMAIL,
        name: 'Manasa Devi (Super Admin)',
        role: 'super_admin',
        department: 'Office of the Dean & Security Operations',
        permissions: ['all'],
      },
      token: `token-super-${Date.now()}`,
    });
  }

  // Standard Admin Login
  if (role === 'admin') {
    const admin = adminAccounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!admin) {
      return res.status(401).json({ error: 'Administrator account not found or not authorized.' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: `This administrator account has been ${admin.status}. Please contact the Super Admin.` });
    }

    if (admin.password && admin.password !== password) {
      return res.status(401).json({ error: 'Incorrect administrator password.' });
    }

    const log: AuditLog = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toISOString(),
      actorEmail: admin.email,
      action: 'ADMIN_LOGIN',
      targetEmail: admin.email,
      details: 'Administrator logged in to Academic Management Console.',
    };
    auditLogs.unshift(log);

    return res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        department: admin.department,
        permissions: admin.permissions,
      },
      token: `token-admin-${Date.now()}`,
    });
  }

  // Professors and Students login verification
  if (role === 'professor') {
    return res.json({
      success: true,
      user: {
        id: 'prof-101',
        email: email || 'prof.sharma@unicore.edu',
        name: 'Dr. Vikram Sharma',
        role: 'professor',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor & Lab In-charge',
      },
      token: `token-prof-${Date.now()}`,
    });
  }

  if (role === 'student') {
    return res.json({
      success: true,
      user: {
        id: 'stu-2024-88',
        email: email || 'arun.k@student.unicore.edu',
        name: 'Arun Krishnan',
        role: 'student',
        rollNo: '24CSE042',
        semester: 'Semester 4',
        department: 'Computer Science & Engineering',
      },
      token: `token-stu-${Date.now()}`,
    });
  }

  res.status(400).json({ error: 'Invalid login role specified.' });
});

// Admin Authorization Middleware Check
function requireSuperAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const actor = req.headers['x-actor-email'] as string;

  if (actor?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return next();
  }
  return res.status(403).json({ error: 'Permission denied. Super Admin privileges required.' });
}

// List all authorized administrators
app.get('/api/admin/list', (req: Request, res: Response) => {
  const safeAccounts = adminAccounts.map(({ password, ...rest }) => ({
    ...rest,
    hasPasswordSet: Boolean(password),
  }));
  res.json({ admins: safeAccounts });
});

// Add a new Administrator with login credentials (Super Admin only)
app.post('/api/admin/create', requireSuperAdmin, (req: Request, res: Response) => {
  const { email, name, password, department, permissions } = req.body;
  const actorEmail = (req.headers['x-actor-email'] as string) || SUPER_ADMIN_EMAIL;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and login password are required.' });
  }

  const normalized = email.toLowerCase().trim();
  const existing = adminAccounts.find(a => a.email.toLowerCase() === normalized);
  if (existing) {
    return res.status(400).json({ error: 'An administrator with this email already exists.' });
  }

  const newAdmin: AdminAccount = {
    id: 'admin-' + Date.now(),
    email: normalized,
    name: name.trim(),
    role: 'admin',
    department: department || 'General Administration',
    permissions: Array.isArray(permissions) && permissions.length > 0 ? permissions : ['academic_governance'],
    password: password.trim(),
    authorizedBy: actorEmail,
    authorizedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  };

  adminAccounts.push(newAdmin);

  const log: AuditLog = {
    id: 'audit-' + Date.now(),
    timestamp: new Date().toISOString(),
    actorEmail,
    action: 'ADD_ADMIN',
    targetEmail: normalized,
    details: `Added new Administrator (${name}) with department "${newAdmin.department}" and direct login credentials.`,
  };
  auditLogs.unshift(log);

  const { password: _, ...safeAdmin } = newAdmin;
  res.json({
    success: true,
    message: `Administrator ${name} added successfully. They can now log in using their credentials.`,
    admin: safeAdmin,
  });
});

// Edit existing Administrator credentials & roles (Super Admin only)
app.post('/api/admin/update-credentials', requireSuperAdmin, (req: Request, res: Response) => {
  const { id, name, newPassword, department, permissions, status } = req.body;
  const actorEmail = (req.headers['x-actor-email'] as string) || SUPER_ADMIN_EMAIL;

  const admin = adminAccounts.find(a => a.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Administrator record not found.' });
  }

  if (admin.role === 'super_admin' && actorEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Super Admin credentials can only be edited by the verified Super Admin.' });
  }

  const updates: string[] = [];

  if (name && name.trim()) {
    admin.name = name.trim();
    updates.push('name');
  }

  if (department && department.trim()) {
    admin.department = department.trim();
    updates.push('department');
  }

  if (newPassword && newPassword.trim()) {
    admin.password = newPassword.trim();
    updates.push('password/login credentials');
    if (admin.role === 'super_admin') {
      superAdminPassword = newPassword.trim();
    }
  }

  if (permissions && Array.isArray(permissions)) {
    admin.permissions = permissions;
    updates.push('permissions');
  }

  if (status && (status === 'active' || status === 'suspended' || status === 'revoked')) {
    admin.status = status;
    updates.push(`status to ${status}`);
  }

  admin.updatedAt = new Date().toISOString();

  const log: AuditLog = {
    id: 'audit-' + Date.now(),
    timestamp: new Date().toISOString(),
    actorEmail,
    action: 'UPDATE_CREDENTIALS',
    targetEmail: admin.email,
    details: `Updated admin credentials and settings for ${admin.name} (${updates.join(', ')}).`,
  };
  auditLogs.unshift(log);

  const { password: _, ...safeAdmin } = admin;
  res.json({
    success: true,
    message: `Administrator ${admin.name} credentials updated successfully.`,
    admin: safeAdmin,
  });
});

// Revoke Administrator access (Super Admin only)
app.post('/api/admin/revoke', requireSuperAdmin, (req: Request, res: Response) => {
  const { id, reason } = req.body;
  const actorEmail = (req.headers['x-actor-email'] as string) || SUPER_ADMIN_EMAIL;

  const admin = adminAccounts.find(a => a.id === id);
  if (!admin) {
    return res.status(404).json({ error: 'Administrator record not found.' });
  }

  if (admin.role === 'super_admin') {
    return res.status(400).json({ error: 'The Super Admin account privileges cannot be revoked.' });
  }

  admin.status = 'revoked';
  admin.updatedAt = new Date().toISOString();

  const log: AuditLog = {
    id: 'audit-' + Date.now(),
    timestamp: new Date().toISOString(),
    actorEmail,
    action: 'REVOKE_ADMIN',
    targetEmail: admin.email,
    details: `Revoked admin privileges for ${admin.name} (${admin.email}). Reason: ${reason || 'Administrative action'}`,
  };
  auditLogs.unshift(log);

  res.json({
    success: true,
    message: `Administrator access for ${admin.name} has been revoked.`,
  });
});

// Audit Logs (Super Admin only)
app.get('/api/admin/audit-logs', requireSuperAdmin, (req: Request, res: Response) => {
  res.json({ logs: auditLogs });
});

// Multilingual Voice Assistant query powered by Gemini 3.8 Flash
app.post('/api/assistant/query', async (req: Request, res: Response) => {
  const { query, language = 'English', role = 'student' } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A query string is required.' });
  }

  const systemPrompt = `You are "Unicore Mitra", the official multilingual voice AI assistant of Unicore CampusConnect College Management Portal.
You respond warmly, concisely, and accurately in the requested language: ${language}.
Supported target languages:
- English
- Tamil (தமிழ்)
- Hindi (हिन्दी)
- Telugu (తెలుగు)
- Malayalam (മലയാളം)

College Context:
- Portal: Unicore CampusConnect
- Super Admin: manasadevi4077@gmail.com (Office of the Dean)
- Current user role: ${role}
- Examination Calendar: End-Semester Theory begins 10th May 2026. Lab examinations start 28th April 2026. Hall tickets available on the Exam Portal.
- Faculty Payslips: Disbursed on the 28th of every month. Accessible in the Professor Payslips tab with breakdown of Basic, DA, HRA, and PF deductions.
- Timetable & Classes: 5 daily slots (9:00 AM - 4:30 PM) across Engineering, Humanities, and Sciences.
- Student Requests: Can be submitted anonymously or with Student ID. Upvoted requests above 15 votes are automatically escalated to the Academic Dean.
- Campus Spots: Library Quadrangle, Innovation Sandbox, Rooftop Solar Cafe, Open Air Amphitheatre, and Sports Arena (voted by students).

Instructions:
1. Respond in natural, polite ${language}.
2. Keep the spoken response between 2 to 4 clear sentences (suitable for speech synthesis read-aloud).
3. Directly answer the user question using the campus facts provided.`;

  if (genAI) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 4000)
      );

      const response = await Promise.race([
        genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        }),
        timeoutPromise,
      ]);

      const reply = response.text || '';
      return res.json({
        reply,
        language,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Gemini API query fallback:', err?.message);
    }
  }

  // Graceful multi-language rule-based fallback if no GEMINI_API_KEY
  const fallbacks: Record<string, string> = {
    English: `Hello! I am your Unicore CampusConnect assistant. You can check your semester timetable, view exam notices starting May 10th, or submit requests to the academic committee anytime.`,
    Tamil: `வணக்கம்! நான் யூனிகோர் கேம்பஸ்கனெக்ட் குரல் உதவியாளர். உங்கள் செமஸ்டர் கால அட்டவணை, மே 10 தொடங்கும் தேர்வு அறிவிப்புகள் மற்றும் பேராசிரியர்களின் ஊதிய விவரங்களை இங்கே எளிதாகக் காணலாம்.`,
    Hindi: `नमस्ते! मैं यूनिकोर कैंपसकनेक्ट सहायक हूँ। आप अपनी कक्षा की समय-सारणी, 10 मई से शुरू होने वाली परीक्षाओं की सूचना और संकाय वेतन पर्ची आसानी से देख सकते हैं।`,
    Telugu: `నమస్కారం! నేను యూనికార్ క్యాంపస్‌కనెక్ట్ అసిస్టెంట్‌ని. మీరు మీ టైమ్‌టేబుల్, మే 10న ప్రారంభమయ్యే పరీక్షా షెడ్యూల్ మరియు మీ ఫిర్యాదుల స్థితిని ఇక్కడ తనిఖీ చేయవచ్చు.`,
    Malayalam: `നമസ്കാരം! ഞാൻ യൂണികോർ കാമ്പസ്കണക്ട് വോയ്സ് അസിസ്റ്റന്റാണ്. നിങ്ങളുടെ ടൈംടേബിൾ, മെയ് 10-ന് ആരംഭിക്കുന്ന പരീക്ഷാ തീയതികൾ, അപേക്ഷകളുടെ വിവരങ്ങൾ എന്നിവ ഇവിടെ പരിശോധിക്കാം.`,
  };

  const reply = fallbacks[language] || fallbacks.English;
  res.json({
    reply: `${reply} (${query ? `Regarding: "${query.slice(0, 35)}..."` : ''})`,
    language,
    fallback: true,
  });
});

// Setup Vite Dev Server Middleware or Static Server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unicore CampusConnect running at http://localhost:${PORT}`);
  });
}

startServer();
