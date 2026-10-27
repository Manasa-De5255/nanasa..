import React, { useState } from 'react';
import { departmentContacts } from '../data/mockData.ts';
import {
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const DirectoryModule: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = departmentContacts.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.department.toLowerCase().includes(q) ||
      d.headName.toLowerCase().includes(q) ||
      d.block.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Department Contacts & Campus Location
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Faculty leadership directory, administrative wings, office consultation hours, and campus directions.
          </p>
        </div>

        <div className="relative w-full sm:w-72 self-start md:self-auto">
          <Search className="w-3.5 h-3.5 text-muted-custom absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department, head, block..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-subtle bg-subtle/50 text-main placeholder:text-muted-custom/60 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Department Directory Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-main uppercase tracking-wider">
              Academic & Administrative Wings ({filtered.length})
            </span>
            <span className="text-xs text-muted-custom font-mono">Verified Institutional Directory</span>
          </div>

          <div className="space-y-3">
            {filtered.map((dept) => {
              const isSuperAdminOffice = dept.id === 'dept-6';
              return (
                <div
                  key={dept.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSuperAdminOffice
                      ? 'border-amber-500/30 bg-amber-50/15 dark:bg-amber-950/20'
                      : 'border-subtle bg-surface hover:border-brand/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-subtle pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-main">
                          {dept.department}
                        </h3>
                        {isSuperAdminOffice && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand font-medium">Head: {dept.headName}</p>
                    </div>

                    <span className="text-[11px] font-mono text-muted-custom px-2 py-1 rounded-md bg-subtle">
                      {dept.block}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-muted-custom">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-main hover:text-brand underline truncate"
                      >
                        {dept.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span className="text-main font-mono">{dept.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{dept.officeRoom}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{dept.officeHours}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Campus Map & Visitor Information */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-subtle bg-surface p-5 space-y-4">
            <div className="space-y-1 border-b border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-main">Main University Campus Location</h2>
              </div>
              <p className="text-xs text-muted-custom">
                Unicore CampusConnect, Institutional Boulevard, Bangalore, Karnataka 560001
              </p>
            </div>

            {/* Embedded Google Maps */}
            <div className="rounded-xl overflow-hidden border border-subtle h-[280px] bg-slate-100 dark:bg-slate-900">
              <iframe
                title="Unicore College Main Campus Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=12.9716,77.5946&z=15&output=embed"
              />
            </div>

            {/* Campus Connectivity Highlights */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-custom">
                Campus Transit & Entry Gates
              </span>

              <div className="p-2.5 rounded-lg bg-subtle space-y-1">
                <div className="font-semibold text-main">Main Gate (North Avenue)</div>
                <div className="text-[11px] text-muted-custom">
                  Visitor check-in, Administration block, and Chancellor Executive Suites.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-subtle space-y-1">
                <div className="font-semibold text-main">Tech Gate (East Wing)</div>
                <div className="text-[11px] text-muted-custom">
                  Direct access to Turing Engineering Labs, Innovation Sandbox, and Library Annex.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-subtle space-y-1">
                <div className="font-semibold text-main">Metro Connectivity</div>
                <div className="text-[11px] text-muted-custom">
                  Direct university shuttle operates every 15 minutes to Central Metro Station.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
