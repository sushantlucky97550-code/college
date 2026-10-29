import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  GraduationCap,
  PlusCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  Calendar,
  AlertCircle,
  Check,
  TrendingUp,
} from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Security'];

const Trainings = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState(isHR || isManager ? 'manage' : 'my'); // 'my' | 'manage'

  // My trainings state (Employee)
  const [myTrainings, setMyTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manage trainings state (HR / Manager)
  const [manageTrainings, setManageTrainings] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    department: 'All',
    instructor: 'StaffSync Academy',
    durationHours: 4,
    deadline: '',
  });

  // Modal progress update state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);

  const fetchMyTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainings/my');
      if (res.data.success) {
        setMyTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error('Failed to load my trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManageTrainings = async () => {
    if (!isHR && !isManager) return;
    try {
      setManageLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/trainings', { params });
      if (res.data.success) {
        setManageTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error('Failed to load manage trainings:', err);
    } finally {
      setManageLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrainings();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchManageTrainings();
    }
  }, [activeTab, selectedCategory]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await api.post('/trainings', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        showToast('Training program created and assigned!');
        setFormData({
          title: '',
          description: '',
          category: 'Technical',
          department: 'All',
          instructor: 'StaffSync Academy',
          durationHours: 4,
          deadline: '',
        });
        fetchManageTrainings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create training');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      setProgressLoading(true);
      const res = await api.put(`/trainings/${selectedCourse._id}/progress`, {
        progressPercent: Number(progressVal),
      });
      if (res.data.success) {
        setSelectedCourse(null);
        showToast(`Progress updated to ${progressVal}%!`);
        fetchMyTrainings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setProgressLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" /> Training & Development
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Skill enhancement, compliance certifications, and career progression modules.
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
                All Programs
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'my' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Courses
              </button>
            </div>
          )}

          {(isHR || isManager) && (
            <button
              onClick={() => {
                setFormError('');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Program</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'my' ? (
        /* MY ASSIGNED COURSES (EMPLOYEE) */
        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner text="Fetching your training modules..." />
          ) : myTrainings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No courses assigned yet</h3>
              <p className="text-xs text-slate-400 mt-1">Your manager or HR will assign modules shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myTrainings.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {course.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          course.myStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : course.myStatus === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {course.myStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{course.description}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Instructor: {course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: {course.durationHours} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                      <span className="text-slate-600">Completion</span>
                      <span className="text-indigo-600 font-bold">{course.myProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${course.myProgress}%` }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setProgressVal(course.myProgress);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all text-center"
                    >
                      Update Course Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MANAGE TRAININGS TAB (HR & MANAGER) */
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filter Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {manageLoading ? (
            <LoadingSpinner text="Loading courses..." />
          ) : manageTrainings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No training modules found</h3>
              <p className="text-xs text-slate-400 mt-1">Click "Create Program" to publish a new module.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {manageTrainings.map((course) => {
                const totalAssigned = course.assignments?.length || 0;
                const completedCount =
                  course.assignments?.filter((a) => a.status === 'Completed').length || 0;
                const percent = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {course.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {course.department} Dept
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{course.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{course.description}</p>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Instructor: {course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duration: {course.durationHours} hrs</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                        <span className="text-slate-600">Company Completion Rate</span>
                        <span className="text-emerald-600 font-bold">
                          {completedCount}/{totalAssigned} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE TRAINING (HR / MANAGER) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish New Training Program"
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Cloud Security & Compliance"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Leadership">Leadership</option>
                <option value="Compliance">Compliance</option>
                <option value="Soft Skills">Soft Skills</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Provider</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Program Syllabus / Description</label>
            <textarea
              required
              rows={3}
              placeholder="Outline what skills and concepts are taught in this module..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Publishing...' : 'Assign Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE COURSE PROGRESS (EMPLOYEE) */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title="Update Course Completion"
        maxWidth="max-w-sm"
      >
        {selectedCourse && (
          <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <p className="font-bold text-slate-800">{selectedCourse.title}</p>
              <p className="text-slate-500 mt-0.5">{selectedCourse.instructor}</p>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-700">Progress:</span>
                <span className="text-indigo-600 font-bold text-sm">{progressVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Not Started)</span>
                <span>50%</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={progressLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                Save Progress
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Trainings;

