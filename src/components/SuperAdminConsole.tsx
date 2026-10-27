import React, { useState, useEffect } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext.tsx';
import { AdminAccount } from '../types/index.ts';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Edit3,
  Clock,
  History,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  XCircle,
  FileText,
  Search
} from 'lucide-react';

export const SuperAdminConsole: React.FC = () => {
  const {
    user,
    adminsList,
    auditLogs,
    fetchAdmins,
    createAdmin,
    updateAdminCredentials,
    revokeAdmin,
    fetchAuditLogs,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'admins' | 'audit'>('admins');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDept, setNewDept] = useState('Academic Affairs');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'academic_governance',
    'timetable_edit',
    'exam_schedule',
  ]);
  const [addError, setAddError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Edit Admin Credentials Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'revoked'>('active');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  // Revoke confirmation modal
  const [revokingAdmin, setRevokingAdmin] = useState<AdminAccount | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchAuditLogs();
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';

  const handleOpenAdd = () => {
    setNewEmail('');
    setNewName('');
    setNewPassword('');
    setNewDept('Academic Affairs');
    setNewPermissions(['academic_governance', 'timetable_edit', 'exam_schedule']);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newEmail || !newName || !newPassword) {
      setAddError('All fields including initial login password are required.');
      return;
    }

    const res = await createAdmin({
      email: newEmail.trim(),
      name: newName.trim(),
      password: newPassword.trim(),
      department: newDept,
      permissions: newPermissions,
    });

    if (res.success) {
      setShowAddModal(false);
      setActionSuccess(`Administrator ${newName} successfully provisioned with login credentials.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setAddError(res.error || 'Failed to create administrator.');
    }
  };

  const handleOpenEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditDept(admin.department);
    setEditPassword('');
    setEditStatus(admin.status);
    setEditPermissions(admin.permissions || []);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditError(null);

    const res = await updateAdminCredentials({
      id: editingAdmin.id,
      name: editName.trim(),
      department: editDept,
      newPassword: editPassword.trim() ? editPassword.trim() : undefined,
      permissions: editPermissions,
      status: editStatus,
    });

    if (res.success) {
      setShowEditModal(false);
      setActionSuccess(`Credentials and settings updated for ${editingAdmin.name}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setEditError(res.error || 'Failed to update credentials.');
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokingAdmin) return;
    const res = await revokeAdmin(revokingAdmin.id, revokeReason);
    setRevokingAdmin(null);
    setRevokeReason('');

    if (res.success) {
      setActionSuccess(`Administrator access for ${revokingAdmin.name} revoked.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const filteredAdmins = adminsList.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Super Admin Governance Console
            </h1>
          </div>
          <p className="text-xs text-muted-custom max-w-2xl">
            Designated Authority: <strong className="font-mono text-main">{SUPER_ADMIN_EMAIL}</strong>.
            Authoritative management of institutional administrators, credential assignments, and immutable security audit logs.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand text-brand-contrast hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin with Credentials</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-subtle pb-3">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-1 transition-colors cursor-pointer ${
              activeTab === 'admins' ? 'text-brand border-b-2 border-brand font-bold' : 'text-muted-custom hover:text-main'
            }`}
          >
            Authorized Administrators ({adminsList.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-1 transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'text-brand border-b-2 border-brand font-bold' : 'text-muted-custom hover:text-main'
            }`}
          >
            Cryptographic Audit Ledger ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'admins' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-muted-custom absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admins by name, email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-subtle bg-subtle/50 text-main placeholder:text-muted-custom/60 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Authorized Admins List */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-subtle bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle/60 border-b border-subtle text-muted-custom uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Department / Scope</th>
                  <th className="py-3 px-4">Role & Status</th>
                  <th className="py-3 px-4">Authorized Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredAdmins.map((admin) => {
                  const isMasterSuper = admin.role === 'super_admin';
                  return (
                    <tr key={admin.id} className="hover:bg-subtle/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-main">{admin.name}</div>
                        <div className="font-mono text-muted-custom text-[11px]">{admin.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-custom">
                        <div className="text-main font-medium">{admin.department}</div>
                        <div className="text-[10px] text-muted-custom flex gap-1 mt-0.5">
                          {admin.permissions?.map((p) => (
                            <span key={p} className="opacity-75">· {p.replace('_', ' ')}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isMasterSuper
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                            }`}
                          >
                            {admin.role.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              admin.status === 'active'
                                ? 'status-approved'
                                : admin.status === 'suspended'
                                ? 'status-pending'
                                : 'status-closed'
                            }`}
                          >
                            {admin.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-custom font-mono text-[11px]">
                        {new Date(admin.authorizedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(admin)}
                              title="Edit Credentials & Role"
                              className="p-1.5 rounded-lg text-muted-custom hover:text-brand hover:bg-subtle transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isMasterSuper && admin.status === 'active' && (
                              <button
                                onClick={() => setRevokingAdmin(admin)}
                                title="Revoke Admin Access"
                                className="p-1.5 rounded-lg text-muted-custom hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-subtle border border-subtle text-xs text-muted-custom">
            <span>
              Cryptographic Audit Log: Every administrative action, credential modification, authorization, and revocation is permanently recorded server-side for institutional compliance.
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-subtle bg-surface hover:bg-subtle/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-main">{log.action}</span>
                    <span className="text-[11px] text-muted-custom">·</span>
                    <span className="text-xs text-brand font-mono">{log.targetEmail}</span>
                  </div>
                  <p className="text-xs text-muted-custom">{log.details}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-custom shrink-0 font-mono">
                  <span>By: {log.actorEmail}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Administrator with Credentials Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-subtle shadow-2xl p-6 sm:p-8 space-y-5 text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-main">Add Administrator</h3>
                  <p className="text-xs text-muted-custom">Provision direct login credentials for academic admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-muted-custom hover:text-main cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Priyadarshini Rao"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Institutional Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="e.g. p.rao@unicore.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">
                  Direct Login Password / Credentials
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Set initial login password"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <span className="text-[10px] text-muted-custom">
                  The admin can immediately sign in with this email and password.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Department Assignment</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Academic Affairs">Academic Affairs</option>
                  <option value="Examination Wing">Examination Wing</option>
                  <option value="Student Welfare & Discipline">Student Welfare & Discipline</option>
                  <option value="Campus Facilities & Safety">Campus Facilities & Safety</option>
                  <option value="Research & Interdisciplinary Studies">Research & Interdisciplinary Studies</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-subtle text-main hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90 cursor-pointer"
                >
                  Authorize Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Credentials Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-subtle shadow-2xl p-6 sm:p-8 space-y-5 text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-main">
                    Edit Credentials & Settings
                  </h3>
                  <p className="text-xs text-muted-custom font-mono">{editingAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-xs text-muted-custom hover:text-main cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">
                  Reset / Change Password (Leave blank to keep existing)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password to update login credentials"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-main">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-subtle text-main hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-subtle shadow-2xl p-6 space-y-4 text-main">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold">Revoke Administrator Privileges</h3>
            </div>
            <p className="text-xs text-muted-custom">
              Are you sure you want to revoke admin permissions for <strong className="text-main">{revokingAdmin.name}</strong> ({revokingAdmin.email})?
              They will no longer be able to log in to the administrative console.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-main">Reason for Revocation</label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. End of tenure, role reallocation"
                className="w-full px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/50 text-main focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokingAdmin(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-subtle text-main hover:bg-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
