import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Megaphone,
  PlusCircle,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Tag,
  Building,
} from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Policy', 'Event', 'Holiday', 'Maintenance'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

const Announcements = () => {
  const { user, isHR } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    category: 'General',
    targetDepartment: 'All',
    isPinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedPriority !== 'All') params.priority = selectedPriority;

      const res = await api.get('/announcements', { params });
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory, selectedPriority]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await api.post('/announcements', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        showToast('Announcement posted successfully!');
        setFormData({
          title: '',
          content: '',
          priority: 'Medium',
          category: 'General',
          targetDepartment: 'All',
          isPinned: false,
        });
        fetchAnnouncements();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        showToast('Announcement deleted');
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" /> Company Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official organizational notices, upcoming events, policy changes, and urgent updates.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => {
              setFormError('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Category & Priority Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Category:
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

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-400">Urgency:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p} Urgency
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <LoadingSpinner text="Loading notices..." />
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No announcements found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no notices published under this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {announcements.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                item.isPinned ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header row with badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : item.priority === 'High'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : item.priority === 'Medium'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    {item.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3 fill-indigo-600" /> Pinned
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 leading-snug">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      item.author?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.author?.name || 'Staff')}`
                    }
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-700">{item.author?.name}</span>
                    <span className="text-slate-400"> • {item.targetDepartment} Dept</span>
                  </div>
                </div>

                {isHR && (
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: POST ANNOUNCEMENT (HR) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Company Announcement"
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Annual Town Hall Meeting"
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
                <option value="General">General</option>
                <option value="Policy">Policy</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority / Urgency</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
            <select
              value={formData.targetDepartment}
              onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="All">All Organization</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body</label>
            <textarea
              required
              rows={4}
              placeholder="Write the full announcement details here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isPinned" className="text-xs font-semibold text-slate-700 select-none">
              Pin to the top of notice boards
            </label>
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
              {formLoading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;

