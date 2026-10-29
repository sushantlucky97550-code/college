import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  Check,
  X,
  User,
} from 'lucide-react';

const Leaves = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState(isHR || isManager ? 'manage' : 'my'); // 'my' | 'manage'

  // My leaves state
  const [myLeaves, setMyLeaves] = useState([]);
  const [balances, setBalances] = useState({ annual: 15, sick: 10, casual: 8 });
  const [loading, setLoading] = useState(true);

  // Manage leaves state (HR & Manager)
  const [manageLeaves, setManageLeaves] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Apply Form state
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ text: '', type: '' });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my');
      if (res.data.success) {
        setMyLeaves(res.data.leaves);
        if (res.data.leaveBalances) {
          setBalances(res.data.leaveBalances);
        }
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManageLeaves = async () => {
    if (!isHR && !isManager) return;
    try {
      setManageLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setManageLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Failed to load manage leaves:', err);
    } finally {
      setManageLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchManageLeaves();
    }
  }, [activeTab, statusFilter]);

  // Calculate requested days count
  const calculateDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setFormError('');

    try {
      const res = await api.post('/leaves/apply', applyForm);
      if (res.data.success) {
        setIsApplyModalOpen(false);
        showToast('Leave request submitted successfully!');
        setApplyForm({
          leaveType: 'Annual',
          startDate: '',
          endDate: '',
          reason: '',
        });
        fetchMyLeaves();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewNote(action === 'Approved' ? 'Approved by supervisor' : 'Rejected due to operational requirements');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      setReviewLoading(true);
      const res = await api.put(`/leaves/${selectedLeave._id}/status`, {
        status: reviewAction,
        reviewNote,
      });
      if (res.data.success) {
        setIsReviewModalOpen(false);
        showToast(`Leave request ${reviewAction.toLowerCase()}!`);
        fetchManageLeaves();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave status');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" /> Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track paid time-off balances, apply for leave, and manage supervisor approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(isHR || isManager) && (
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'manage' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approvals & Requests
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'my' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Leaves
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setFormError('');
              setIsApplyModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Balances KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Annual Vacation
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Quota: 20
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">{balances.annual ?? 15}</span>
            <span className="text-xs text-slate-400">days remaining</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, ((balances.annual ?? 15) / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Medical / Sick
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Quota: 12
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{balances.sick ?? 10}</span>
            <span className="text-xs text-slate-400">days remaining</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, ((balances.sick ?? 10) / 12) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Casual / Personal
            </span>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Quota: 10
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600">{balances.casual ?? 8}</span>
            <span className="text-xs text-slate-400">days remaining</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, ((balances.casual ?? 8) / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {activeTab === 'my' ? (
        /* MY LEAVES HISTORY TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">My Leave Application History</h3>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching leave records..." />
          ) : myLeaves.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              You haven't submitted any leave requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Requested Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reviewer Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{leave.leaveType}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-700">{leave.daysCount} days</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        {leave.reviewNote || (leave.status === 'Pending' ? 'Awaiting supervisor decision' : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* MANAGE LEAVE APPROVALS TAB (HR & MANAGER) */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-indigo-600" /> Filter Requests:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {manageLoading ? (
              <LoadingSpinner text="Fetching requests to approve..." />
            ) : manageLeaves.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No leave requests found matching this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Date Range</th>
                      <th className="py-3.5 px-4">Days</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manageLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={
                              leave.user?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leave.user?.name || '')}`
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{leave.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{leave.user?.department}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{leave.leaveType}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700">{leave.daysCount} days</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : leave.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {leave.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenReview(leave, 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(leave, 'Rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 border border-rose-200"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Decided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR LEAVE */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time-Off / Leave"
        maxWidth="max-w-md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="Annual">Annual Vacation ({balances.annual ?? 15} days available)</option>
              <option value="Sick">Sick Leave ({balances.sick ?? 10} days available)</option>
              <option value="Casual">Casual / Personal ({balances.casual ?? 8} days available)</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          {requestedDays > 0 && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-medium">Requested Duration:</span>
              <span className="text-indigo-700 font-bold">{requestedDays} working day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              placeholder="Please explain the reason for this time-off..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {applyLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REVIEW LEAVE (APPROVE / REJECT) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction} Leave Application`}
        maxWidth="max-w-md"
      >
        {selectedLeave && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <p>
                <span className="font-semibold text-slate-500">Applicant:</span>{' '}
                <span className="font-bold text-slate-800">{selectedLeave.user?.name}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Duration:</span>{' '}
                <span className="font-bold text-slate-800">{selectedLeave.daysCount} days</span> ({new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()})
              </p>
              <p>
                <span className="font-semibold text-slate-500">Reason:</span> "{selectedLeave.reason}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supervisor Remarks / Reason
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add comments..."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewLoading}
                className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md ${
                  reviewAction === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                Confirm {reviewAction}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Leaves;

