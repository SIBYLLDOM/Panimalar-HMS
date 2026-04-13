import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HostelManagement from './HostelManagement';
import RoomManagement from './RoomManagement';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok) {
          setDashboardStats(data);
        } else {
          console.error('Failed to fetch dashboard data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'hostels', label: 'Hostel Management', icon: '🏢' },
    { id: 'rooms', label: 'Room & Bed Management', icon: '🏠' },
  ];

  if (loading) {
    return (
      <div className="super-admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-container">
      <header className="super-admin-header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">
              <span className="logo-icon">🏫</span>
              <span className="logo-text">Panimalar HMS</span>
            </div>
            <div className="user-info">
              <span className="welcome-text">Welcome, {user?.name}</span>
              <span className="role-badge">Super Admin</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="super-admin-main">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-header">
                  <span className="stat-icon">👥</span>
                  <span className="stat-title">Total Students</span>
                </div>
                <div className="stat-value">{dashboardStats?.statistics?.totalStudents || 0}</div>
                <div className="stat-change positive">+12% from last month</div>
              </div>

              <div className="stat-card secondary">
                <div className="stat-header">
                  <span className="stat-icon">🏢</span>
                  <span className="stat-title">Total Hostels</span>
                </div>
                <div className="stat-value">{dashboardStats?.statistics?.totalHostels || 0}</div>
                <div className="stat-change neutral">+2 new this month</div>
              </div>

              <div className="stat-card success">
                <div className="stat-header">
                  <span className="stat-icon">🏠</span>
                  <span className="stat-title">Total Rooms</span>
                </div>
                <div className="stat-value">{dashboardStats?.statistics?.totalRooms || 0}</div>
                <div className="stat-change positive">+8% occupancy</div>
              </div>

              <div className="stat-card info">
                <div className="stat-header">
                  <span className="stat-icon">🛏</span>
                  <span className="stat-title">Total Beds</span>
                </div>
                <div className="stat-value">{dashboardStats?.statistics?.totalBeds || 0}</div>
                <div className="stat-change">{dashboardStats?.occupancyRate || 0}% occupied</div>
              </div>
            </div>

            <div className="quick-actions-grid">
              <div className="action-card">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="quick-action-btn primary"
                    onClick={() => setActiveTab('hostels')}
                  >
                    <span className="action-icon">➕</span>
                    Add New Hostel
                  </button>
                  <button 
                    className="quick-action-btn secondary"
                    onClick={() => setActiveTab('rooms')}
                  >
                    <span className="action-icon">🏠</span>
                    Manage Rooms
                  </button>
                  <button className="quick-action-btn info">
                    <span className="action-icon">📊</span>
                    Generate Report
                  </button>
                  <button className="quick-action-btn warning">
                    <span className="action-icon">👥</span>
                    Manage Students
                  </button>
                </div>
              </div>

              <div className="activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon success">✓</div>
                    <div className="activity-details">
                      <div className="activity-text">New hostel "Boys Block A" created</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon info">ℹ</div>
                    <div className="activity-details">
                      <div className="activity-text">Room allocation updated</div>
                      <div className="activity-time">5 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon warning">⚠</div>
                    <div className="activity-details">
                      <div className="activity-text">3 pending leave requests</div>
                      <div className="activity-time">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hostels' && <HostelManagement />}
        {activeTab === 'rooms' && <RoomManagement />}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
