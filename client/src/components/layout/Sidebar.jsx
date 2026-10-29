import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Megaphone,
  GraduationCap,
  UserCircle,
  X,
  Layers,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['hr', 'manager'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: Clock,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      name: 'Leaves & Time-Off',
      path: '/leaves',
      icon: CalendarDays,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      name: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      name: 'Training & Dev',
      path: '/trainings',
      icon: GraduationCap,
      roles: ['hr', 'manager', 'employee'],
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: UserCircle,
      roles: ['hr', 'manager', 'employee'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                Staff<span className="text-indigo-400">Sync</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                HR Enterprise
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </div>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card in Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
              {user?.department?.substring(0, 2) || 'SS'}
            </div>
            <div className="truncate text-xs">
              <p className="text-slate-300 font-medium truncate">{user?.department}</p>
              <p className="text-slate-500 text-[11px] truncate">StaffSync v1.0 MERN</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

