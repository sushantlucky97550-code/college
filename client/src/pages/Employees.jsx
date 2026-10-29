import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Building,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  DollarSign,
  Grid,
  List,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Design',
  'Finance',
  'Operations',
];

const Employees = () => {
  const { user, isHR } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    phone: '+1 (555) 000-0000',
    address: '123 Innovation Way',
    salary: 75000,
    managerId: '',
    status: 'Active',
    emergencyContact: {
      name: '',
      relationship: 'Family',
      phone: '',
    },
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (search) params.search = search;

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/employees/supervisors');
      if (res.data.success) {
        setManagers(res.data.managers);
      }
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDept, selectedStatus]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenAdd = () => {
    setFormError('');
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Developer',
      phone: '+1 (555) 000-0000',
      address: '123 Innovation Way',
      salary: 75000,
      managerId: '',
      status: 'Active',
      emergencyContact: {
        name: 'Family Member',
        relationship: 'Spouse',
        phone: '+1 555-0000',
      },
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormError('');
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      position: emp.position,
      phone: emp.phone,
      address: emp.address,
      salary: emp.salary,
      managerId: emp.managerId?._id || '',
      status: emp.status,
      emergencyContact: {
        name: emp.emergencyContact?.name || '',
        relationship: emp.emergencyContact?.relationship || 'Family',
        phone: emp.emergencyContact?.phone || '',
      },
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setSuccessToast('New employee onboarded successfully!');
        setTimeout(() => setSuccessToast(''), 4000);
        fetchEmployees();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await api.put(`/employees/${selectedEmployee._id}`, formData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        setSuccessToast('Employee details updated successfully!');
        setTimeout(() => setSuccessToast(''), 4000);
        fetchEmployees();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from StaffSync?`)) {
      return;
    }
    try {
      const res = await api.delete(`/employees/${empId}`);
      if (res.data.success) {
        setSuccessToast(`${name} has been removed.`);
        setTimeout(() => setSuccessToast(''), 4000);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Employee Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isHR
              ? 'Manage company personnel, job roles, departments, salaries, and onboarding records.'
              : `Viewing team members in your department (${user?.department}).`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Employee Button (HR Only) */}
          {isHR && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Dept:
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Content */}
      {loading ? (
        <LoadingSpinner text="Fetching employee records..." />
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No employees found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <img
                    src={
                      emp.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`
                    }
                    alt={emp.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm mb-3"
                  />
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : emp.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm leading-tight">{emp.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{emp.position}</p>
                <p className="text-xs text-slate-500 mt-0.5">{emp.department}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="capitalize">Role: {emp.role}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenView(emp)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>

                {isHR && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {emp._id !== user._id && (
                      <button
                        onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department & Role</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isHR && <th className="py-3.5 px-4">Salary</th>}
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={
                          emp.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`
                        }
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[11px] text-slate-400">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700">{emp.position}</p>
                      <p className="text-[11px] text-slate-400">{emp.department} • {emp.role}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{emp.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        ${emp.salary?.toLocaleString()}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isHR && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {emp._id !== user._id && (
                              <button
                                onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW EMPLOYEE (HR) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Employee"
        maxWidth="max-w-2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@staffsync.com"
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Access Level</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel / Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Position</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Senior Cloud Engineer"
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Salary (USD)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Direct Supervisor</label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
              >
                <option value="">-- No Direct Supervisor --</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.department} - {m.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Onboarding...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT EMPLOYEE (HR) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Employee: ${selectedEmployee?.name}`}
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supervisor</label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">-- No Direct Supervisor --</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW EMPLOYEE DETAILS */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Profile Details"
        maxWidth="max-w-md"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <img
                src={
                  selectedEmployee.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedEmployee.name)}`
                }
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedEmployee.name}</h3>
                <p className="text-xs text-indigo-700 font-semibold">{selectedEmployee.position}</p>
                <p className="text-xs text-slate-500">{selectedEmployee.department} Department</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Email Address:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Contact Number:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Current Status:</span>
                <span className="font-bold text-emerald-600">{selectedEmployee.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">System Role:</span>
                <span className="font-bold uppercase text-indigo-600">{selectedEmployee.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Reporting Manager:</span>
                <span className="font-semibold text-slate-800">
                  {selectedEmployee.managerId?.name || 'Direct to VP / None'}
                </span>
              </div>
              {isHR && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-medium text-slate-400">Compensation:</span>
                  <span className="font-bold text-slate-800">
                    ${selectedEmployee.salary?.toLocaleString()} / year
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Address:</span>
                <span className="font-semibold text-slate-800 text-right">{selectedEmployee.address}</span>
              </div>
              <div className="pt-2">
                <p className="font-bold text-slate-700 mb-1">Emergency Contact</p>
                <p className="text-slate-500">
                  {selectedEmployee.emergencyContact?.name} ({selectedEmployee.emergencyContact?.relationship}) &mdash;{' '}
                  <span className="font-semibold">{selectedEmployee.emergencyContact?.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;

