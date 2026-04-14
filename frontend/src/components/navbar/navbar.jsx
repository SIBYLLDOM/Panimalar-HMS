import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  BedDouble,
  Bell,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BarChart2,
  Settings,
} from 'lucide-react';

import '../../assets/css/navbar.css';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/hod', end: true, icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/hod/leaves', icon: FileText, label: 'Leave Requests', badge: 11 },
      { to: '/hod/students', icon: Users, label: 'Students' },
    ],
  },
  {
    label: 'Hostel',
    items: [
      { to: '/hod/hostel', icon: BedDouble, label: 'Hostel Overview' },
      { to: '/hod/reports', icon: BarChart2, label: 'Reports' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/hod/notifications', icon: Bell, label: 'Notifications', badge: 3 },
      { to: '/hod/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const Navbar = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    else console.log('Logout triggered');
  };

  return (
    <aside className={`hod-navbar ${collapsed ? 'collapsed' : ''}`}>

      <div className="navbar-brand">
        <div className="brand-icon">
          <GraduationCap size={20} />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Panimalar</span>
            <span className="brand-sub">HMS Portal</span>
          </div>
        )}
      </div>

      <button
        className="collapse-toggle"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      <nav className="navbar-nav">
        {NAV_SECTIONS.map((section) => (
          <div className="nav-section" key={section.label}>
            {!collapsed && (
              <p className="nav-section-label">{section.label}</p>
            )}
            {section.items.map(({ to, end, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                {!collapsed && <span className="nav-label">{label}</span>}
                {!collapsed && badge ? (
                  <span className="nav-badge">{badge}</span>
                ) : null}
                {collapsed && badge ? (
                  <span className="nav-badge-dot"></span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="navbar-footer">
        {!collapsed && (
          <div className="footer-profile">
            <div className="footer-avatar">RK</div>
            <div className="footer-info">
              <span className="footer-name">Dr. Ramesh Kumar</span>
              <span className="footer-role">Head of Department</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="footer-avatar footer-avatar-solo">RK</div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} strokeWidth={1.8} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
  );
};

export default Navbar;