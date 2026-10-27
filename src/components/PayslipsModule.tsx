import React, { useState } from 'react';
import { initialPayslips } from '../data/mockData.ts';
import { Payslip } from '../types/index.ts';
import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Printer,
  Download,
  Building,
  User,
  Shield,
  X
} from 'lucide-react';

export const PayslipsModule: React.FC = () => {
  const [payslips] = useState<Payslip[]>(initialPayslips);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips[0]);
  const [showModal, setShowModal] = useState(false);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleOpenStatement = (slip: Payslip) => {
    setSelectedPayslip(slip);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="rounded-2xl bg-surface border border-subtle p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-main">
              Faculty Payslips & Compensation Ledger
            </h1>
          </div>
          <p className="text-xs text-muted-custom">
            Official monthly electronic salary statements, DA & HRA calculations, and tax withholdings.
          </p>
        </div>

        {selectedPayslip && (
          <button
            onClick={() => handleOpenStatement(selectedPayslip)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-brand-contrast hover:opacity-90 cursor-pointer shadow-xs self-start md:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official Statement</span>
          </button>
        )}
      </div>

      {/* Salary Overview KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-subtle bg-surface space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-custom">
            Latest Net Disbursed
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(payslips[0].netSalary)}
          </div>
          <span className="text-[10px] text-muted-custom">
            Disbursed on {payslips[0].disbursementDate}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-subtle bg-surface space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-custom">
            Basic Monthly Scale
          </span>
          <div className="text-xl font-bold font-mono text-main tabular-nums">
            {formatCurrency(payslips[0].basicPay)}
          </div>
          <span className="text-[10px] text-muted-custom">7th Pay Commission Band 12</span>
        </div>

        <div className="p-4 rounded-xl border border-subtle bg-surface space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-custom">
            Allowances (DA + HRA)
          </span>
          <div className="text-xl font-bold font-mono text-brand tabular-nums">
            {formatCurrency(payslips[0].da + payslips[0].hra + payslips[0].allowances)}
          </div>
          <span className="text-[10px] text-muted-custom">DA (40%) + HRA (24%)</span>
        </div>

        <div className="p-4 rounded-xl border border-subtle bg-surface space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-custom">
            Monthly Withholdings
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCurrency(payslips[0].pfDeduction + payslips[0].taxDeduction)}
          </div>
          <span className="text-[10px] text-muted-custom">PF Contribution & TDS</span>
        </div>
      </div>

      {/* Payslips History Table */}
      <div className="rounded-2xl border border-subtle bg-surface overflow-hidden">
        <div className="p-4 border-b border-subtle flex items-center justify-between">
          <h2 className="text-sm font-bold text-main">Salary Disbursement History</h2>
          <span className="text-xs text-muted-custom font-mono">Academic Year 2025 - 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-subtle/60 border-b border-subtle text-muted-custom uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4 text-right">Basic Pay</th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Take-Home</th>
                <th className="py-3 px-4">Status & Ref</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle font-mono">
              {payslips.map((slip) => {
                const totalAllowances = slip.da + slip.hra + slip.allowances;
                const totalDeductions = slip.pfDeduction + slip.taxDeduction;
                return (
                  <tr key={slip.id} className="hover:bg-subtle/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-main">
                        {slip.month} {slip.year}
                      </div>
                      <div className="text-[10px] text-muted-custom font-mono">
                        Date: {slip.disbursementDate}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-main">
                      {formatCurrency(slip.basicPay)}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-brand font-medium">
                      +{formatCurrency(totalAllowances)}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      -{formatCurrency(totalDeductions)}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {formatCurrency(slip.netSalary)}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="status-approved px-2 py-0.5 rounded text-[10px] font-semibold">
                          {slip.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-custom font-mono mt-0.5">
                        {slip.transactionRef}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <button
                        onClick={() => handleOpenStatement(slip)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-subtle hover:bg-surface border border-subtle text-main transition-colors cursor-pointer"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Payslip Statement Modal */}
      {showModal && selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-surface border border-subtle shadow-2xl p-6 sm:p-8 space-y-6 text-main max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-subtle">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-brand" />
                <div>
                  <h3 className="text-base font-bold text-main">
                    Unicore College of Engineering & Technology
                  </h3>
                  <span className="text-xs text-muted-custom">
                    Official Salary & Remuneration Certificate
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-muted-custom hover:text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Details Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-subtle border border-subtle text-xs">
              <div>
                <span className="text-muted-custom text-[10px] uppercase">Faculty Name</span>
                <p className="font-bold text-main">{selectedPayslip.facultyName}</p>
              </div>
              <div>
                <span className="text-muted-custom text-[10px] uppercase">Employee ID</span>
                <p className="font-mono text-main">{selectedPayslip.employeeId}</p>
              </div>
              <div>
                <span className="text-muted-custom text-[10px] uppercase">Pay Month</span>
                <p className="font-bold text-main">
                  {selectedPayslip.month} {selectedPayslip.year}
                </p>
              </div>
              <div>
                <span className="text-muted-custom text-[10px] uppercase">Disbursement Status</span>
                <p className="text-emerald-600 font-semibold">{selectedPayslip.status}</p>
              </div>
            </div>

            {/* Earnings vs Deductions Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="rounded-xl border border-subtle p-4 space-y-2.5">
                <h4 className="font-bold text-brand uppercase text-[11px] pb-1 border-b border-subtle">
                  Earnings Breakdown
                </h4>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">Basic Pay</span>
                  <span className="text-main font-semibold">{formatCurrency(selectedPayslip.basicPay)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">Dearness Allowance (DA)</span>
                  <span className="text-main">{formatCurrency(selectedPayslip.da)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">House Rent Allowance (HRA)</span>
                  <span className="text-main">{formatCurrency(selectedPayslip.hra)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">Special Academic Allowances</span>
                  <span className="text-main">{formatCurrency(selectedPayslip.allowances)}</span>
                </div>
                <div className="pt-2 border-t border-subtle flex justify-between font-bold font-mono text-brand">
                  <span>Gross Remuneration</span>
                  <span>
                    {formatCurrency(
                      selectedPayslip.basicPay +
                        selectedPayslip.da +
                        selectedPayslip.hra +
                        selectedPayslip.allowances
                    )}
                  </span>
                </div>
              </div>

              {/* Deductions */}
              <div className="rounded-xl border border-subtle p-4 space-y-2.5">
                <h4 className="font-bold text-amber-600 uppercase text-[11px] pb-1 border-b border-subtle">
                  Statutory Deductions
                </h4>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">Provident Fund (PF - 12%)</span>
                  <span className="text-main">{formatCurrency(selectedPayslip.pfDeduction)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-custom">Tax Deducted at Source (TDS)</span>
                  <span className="text-main">{formatCurrency(selectedPayslip.taxDeduction)}</span>
                </div>
                <div className="flex justify-between font-mono text-muted-custom">
                  <span>Professional Tax</span>
                  <span className="text-main font-mono">Included</span>
                </div>
                <div className="pt-8 border-t border-subtle flex justify-between font-bold font-mono text-amber-600">
                  <span>Total Deductions</span>
                  <span>
                    {formatCurrency(selectedPayslip.pfDeduction + selectedPayslip.taxDeduction)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Amount Banner */}
            <div className="p-4 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-brand">
                  Net Salary Transferred to Bank
                </span>
                <div className="text-2xl font-bold font-mono text-brand tabular-nums">
                  {formatCurrency(selectedPayslip.netSalary)}
                </div>
              </div>
              <div className="text-right text-[11px] text-muted-custom font-mono">
                <div>Ref: {selectedPayslip.transactionRef}</div>
                <div>Account: State Bank of India (**4481)</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-muted-custom">
                Electronically generated on Unicore CampusConnect · Signature valid
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Simulated download: Payslip_${selectedPayslip.month}_${selectedPayslip.year}.pdf generated successfully.`)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand text-brand-contrast hover:opacity-90 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
