import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/css/hod/sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="hod-sidebar">
      <div className="sidebar-logo">
        <LayoutDashboard size={28} />
        Panimalar HMS
      </div>
      
      <div className="sidebar-nav">
        <NavLink 
          to="/hod" 
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/hod/leaves" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          Leave Requests
        </NavLink>
        
        <NavLink 
          to="/hod/students" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          Students
        </NavLink>
      </div>
      
      <div className="sidebar-logout">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
