import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Clock,
  Megaphone,
  GraduationCap,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Building,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [clockMsg, setClockMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.role]);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      setClockMsg('');
      const res = await api.post('/attendance/clock-in', { notes: 'Clocked in from Dashboard' });
      setClockMsg(res.data.message);
      fetchDashboard();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Clock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      setClockMsg('');
      const res = await api.post('/attendance/clock-out');
      setClockMsg(res.data.message);
      fetchDashboard();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Clock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard analytics..." />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm uppercase tracking-wide">
              {user?.role === 'hr' ? 'HR Portal' : user?.role === 'manager' ? 'Manager Hub' : 'Employee Portal'}
            </span>
            <span className="text-indigo-200 text-xs">• {user?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-1 text-indigo-100 text-sm max-w-xl">
            {user?.role === 'hr'
              ? 'Track organizational headcount, manage leave approvals, review daily attendance, and broadcast notices.'
              : user?.role === 'manager'
              ? `Oversee your ${user?.department} team, review leave requests, and monitor skills development.`
              : 'Log your daily work hours, apply for leaves, track your courses, and stay updated with company news.'}
          </p>
        </div>

        {/* Quick Employee Clock widget inside header if role is employee */}
        {user?.role === 'employee' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center min-w-[220px]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-indigo-200 mb-2">
              <Clock className="w-4 h-4" /> Today's Shift
            </div>
            {stats.isClockedOut ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
                </span>
                <p className="text-[11px] text-indigo-200 mt-1">
                  Worked {stats.todayAttendance?.workDuration || 8} hrs
                </p>
              </div>
            ) : stats.isClockedIn ? (
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Clocked In at {new Date(stats.todayAttendance?.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  Clock Out
                </button>
              </div>
            ) : (
              <div className="text-center w-full">
                <p className="text-xs text-indigo-100 mb-2">Not clocked in yet</p>
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Clock In Now
                </button>
              </div>
            )}
            {clockMsg && <p className="text-[10px] text-amber-200 mt-1">{clockMsg}</p>}
          </div>
        )}
      </div>

      {/* ===================== HR DASHBOARD ===================== */}
      {user?.role === 'hr' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Employees
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{stats.totalEmployees || 0}</span>
                <span className="text-xs font-medium text-emerald-600">Active: {stats.activeEmployees || 0}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Across 7 departments</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Present Today
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{stats.todayPresent || 0}</span>
                <span className="text-xs font-medium text-emerald-600">{stats.attendanceRate || 0}% rate</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{stats.todayLate || 0} marked late today</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Leaves
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{stats.pendingLeaves || 0}</span>
                <span className="text-xs font-medium text-amber-600">Requires review</span>
              </div>
              <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1 inline-flex items-center gap-1">
                Review requests <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trainings Active
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{stats.totalTrainings || 0}</span>
                <span className="text-xs font-medium text-purple-600">Enrolled modules</span>
              </div>
              <Link to="/trainings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1 inline-flex items-center gap-1">
                Manage Hub <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* HR Middle Section: Department Distribution & Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" /> Department Headcount
                </h3>
                <span className="text-xs font-medium text-slate-400">Total: {stats.totalEmployees || 0}</span>
              </div>
              <div className="space-y-3">
                {stats.deptDistribution?.map((dept) => {
                  const percent = Math.round((dept.count / (stats.totalEmployees || 1)) * 100);
                  return (
                    <div key={dept._id}>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>{dept._id}</span>
                        <span className="text-slate-400">{dept.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Leaves Waiting Approval */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock4 className="w-4 h-4 text-amber-500" /> Recent Leave Applications
                </h3>
                <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  View All &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Employee</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.recentLeaves?.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <img
                            src={leave.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leave.user?.name || '')}`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{leave.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{leave.user?.department}</p>
                          </div>
                        </td>
                        <td className="py-3 font-medium text-slate-600">{leave.leaveType}</td>
                        <td className="py-3 text-slate-500">{leave.daysCount} days</td>
                        <td className="py-3">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MANAGER DASHBOARD ===================== */}
      {user?.role === 'manager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Department Team
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{stats.teamSize || 0}</span>
                <span className="text-xs text-slate-500">Members in {stats.department}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Present Today
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">{stats.teamPresentToday || 0}</span>
                <span className="text-xs text-slate-500">of {stats.teamSize} checked-in</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Team Leaves
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600">{stats.pendingTeamLeaves || 0}</span>
                <span className="text-xs text-slate-500">Awaiting your approval</span>
              </div>
              <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1 inline-flex items-center gap-1">
                Approve requests &rarr;
              </Link>
            </div>
          </div>

          {/* Team Recent Leaves */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Team Time-Off Requests</h3>
              <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Manage All &rarr;
              </Link>
            </div>

            {stats.recentTeamLeaves?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending leave requests from your team.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentTeamLeaves?.map((leave) => (
                  <div
                    key={leave._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={leave.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leave.user?.name || '')}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{leave.user?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {leave.leaveType} • {leave.daysCount} days ({new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <Link
                        to="/leaves"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== EMPLOYEE DASHBOARD ===================== */}
      {user?.role === 'employee' && (
        <div className="space-y-6">
          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Annual Vacation Days
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {stats.leaveBalances?.annual ?? 15}
                </span>
                <span className="text-xs text-slate-400">days available</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((stats.leaveBalances?.annual ?? 15) / 20) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sick Leave Allowance
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {stats.leaveBalances?.sick ?? 10}
                </span>
                <span className="text-xs text-slate-400">days available</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((stats.leaveBalances?.sick ?? 10) / 12) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Casual / Personal
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-600">
                  {stats.leaveBalances?.casual ?? 8}
                </span>
                <span className="text-xs text-slate-400">days available</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((stats.leaveBalances?.casual ?? 8) / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions & My Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">My Recent Leave Requests</h3>
                <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Apply & View All &rarr;
                </Link>
              </div>

              {stats.myRecentLeaves?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  You haven't applied for any leaves yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.myRecentLeaves?.map((leave) => (
                    <div
                      key={leave._id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{leave.leaveType} Leave</span>
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
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(leave.startDate).toLocaleDateString()} &mdash; {new Date(leave.endDate).toLocaleDateString()} ({leave.daysCount} days)
                        </p>
                        <p className="text-xs text-slate-600 mt-1 italic">"{leave.reason}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Training summary card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-1">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Learning Path
              </h3>
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-indigo-900">Assigned Courses</span>
                  <span className="text-lg font-bold text-indigo-700">{stats.trainingsCount || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Completed:</span>
                  <span className="font-semibold text-emerald-600">{stats.completedTrainings || 0}</span>
                </div>
              </div>
              <Link
                to="/trainings"
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                Go to Training Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===================== COMPANY ANNOUNCEMENTS BULLETIN (ALL ROLES) ===================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Company Announcements & News</h3>
          </div>
          <Link to="/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View All News &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.recentAnnouncements?.map((item) => (
            <div
              key={item._id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.content}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {item.author?.name || 'HR Team'}</span>
                <span className="text-indigo-600 font-medium">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

