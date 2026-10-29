import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
  Calendar,
  Filter,
  Check,
  AlertCircle,
  Timer,
} from 'lucide-react';

const Attendance = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'company'
  const [currentTime, setCurrentTime] = useState(new Date());

  // Personal attendance state
  const [todayStatus, setTodayStatus] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState({ text: '', type: '' });

  // Company / Team logs state (HR & Manager)
  const [companyRecords, setCompanyRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [companyLoading, setCompanyLoading] = useState(false);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const [todayRes, histRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my'),
      ]);

      if (todayRes.data.success) {
        setTodayStatus(todayRes.data);
      }
      if (histRes.data.success) {
        setMyHistory(histRes.data.records);
        setSummary(histRes.data.summary);
      }
    } catch (err) {
      console.error('Failed to load attendance info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAttendance = async () => {
    if (!isHR && !isManager) return;
    try {
      setCompanyLoading(true);
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedDept !== 'All') params.department = selectedDept;

      const res = await api.get('/attendance/all', { params });
      if (res.data.success) {
        setCompanyRecords(res.data.records);
      }
    } catch (err) {
      console.error('Failed to load company attendance:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === 'company') {
      fetchCompanyAttendance();
    }
  }, [activeTab, selectedDate, selectedDept]);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: '', type: '' }), 4000);
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/attendance/clock-in', { notes });
      if (res.data.success) {
        showToast(res.data.message);
        setNotes('');
        fetchMyAttendance();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Clock in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/attendance/clock-out');
      if (res.data.success) {
        showToast(res.data.message);
        fetchMyAttendance();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Clock out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header and Tab switcher for HR / Manager */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" /> Attendance Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time shift clocking, daily timestamps, work duration, and audit logs.
          </p>
        </div>

        {(isHR || isManager) && (
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'my' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'company' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHR ? 'Company Logs' : 'Team Logs'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'my' ? (
        <div className="space-y-6">
          {/* Main Clock Widget & Shift Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Interactive Clock Box */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between lg:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Timer className="w-4 h-4" /> Real-time Clock
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Threshold: 09:30 AM
                  </span>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
                    {currentTime.toLocaleTimeString([], { hour12: true })}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentTime.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                {todayStatus?.isClockedOut ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">Day Shift Completed</p>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Worked {todayStatus.record?.workDuration} hours today
                    </p>
                  </div>
                ) : todayStatus?.isClockedIn ? (
                  <div className="space-y-3">
                    <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-2xl p-3 text-center">
                      <p className="text-xs text-indigo-200">
                        Clocked In at{' '}
                        <span className="font-bold text-white">
                          {new Date(todayStatus.record?.clockIn).toLocaleTimeString()}
                        </span>
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200">
                        Status: {todayStatus.record?.status}
                      </span>
                    </div>

                    <button
                      onClick={handleClockOut}
                      disabled={actionLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Clock Out For Today</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Optional arrival note..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <button
                      onClick={handleClockIn}
                      disabled={actionLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Clock In Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Logged Days
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-slate-800">
                    {summary?.totalDays || 0}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Last 60 working day window</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    On-Time Arrivals
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-600">
                    {summary?.totalPresent || 0}
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-4 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> High punctuality rating
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Late Arrivals
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-amber-600">
                    {summary?.totalLate || 0}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Clocked in after 09:30 AM</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Avg Hours Per Day
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                    {summary?.averageHours || '0.0'} <span className="text-sm font-normal text-slate-500">hrs</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Standard target: 8.0 hrs/day</p>
              </div>
            </div>
          </div>

          {/* Personal History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" /> My Attendance Log History
              </h3>
              <span className="text-xs text-slate-400 font-medium">{myHistory.length} records</span>
            </div>

            {loading ? (
              <LoadingSpinner text="Loading logs..." />
            ) : myHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No attendance logs found yet. Clock in to begin recording!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Clock In</th>
                      <th className="py-3 px-4">Clock Out</th>
                      <th className="py-3 px-4">Total Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {new Date(item.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {item.clockOut
                            ? new Date(item.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-indigo-700">
                          {item.workDuration ? `${item.workDuration} hrs` : 'In progress'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* COMPANY / TEAM LOGS TAB (HR & MANAGER) */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Calendar className="w-4 h-4 text-indigo-600" /> Select Date:
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {isHR && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-600 font-semibold">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {companyLoading ? (
              <LoadingSpinner text="Fetching attendance records..." />
            ) : companyRecords.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No attendance logs found for {selectedDate}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Clock In</th>
                      <th className="py-3.5 px-4">Clock Out</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companyRecords.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={
                              item.user?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.user?.name || '')}`
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{item.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{item.user?.position}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">{item.user?.department}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {new Date(item.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.clockOut
                            ? new Date(item.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Currently Clocked In'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-indigo-700">
                          {item.workDuration ? `${item.workDuration} hrs` : '--'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                          {item.notes || '-'}
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
    </div>
  );
};

export default Attendance;

