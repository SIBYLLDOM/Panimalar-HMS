import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData, activeTab === 'faculty');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ email: '', password: '' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Panimalar Hostel Management</h1>
          <p>Sign in to your account</p>
        </div>

        <div className="tab-container">
          <button
            className={`tab ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => handleTabChange('student')}
          >
            Student Login
          </button>
          <button
            className={`tab ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => handleTabChange('faculty')}
          >
            Faculty Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : `Sign In as ${activeTab === 'student' ? 'Student' : 'Faculty'}`}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {activeTab === 'student' ? (
              <>
                New student? <a href="#register">Register here</a>
              </>
            ) : (
              <>
                Faculty login for Admin, HOD, and Warden
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
