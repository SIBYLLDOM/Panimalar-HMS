import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../assets/css/hod/layout.css';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="hod-header">
      <h1>{title || 'Dashboard'}</h1>
      <div className="hod-profile">
        <span>{user?.name} (HOD - {user?.department})</span>
        <div className="profile-icon">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
