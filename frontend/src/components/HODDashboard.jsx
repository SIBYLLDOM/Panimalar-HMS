import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const HODDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/hod', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok) {
          setDashboardData(data);
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h3>Failed to load dashboard</h3>
          <p>Please try refreshing page</p>
        </div>
      </div>
    );
  }

  const { department, statistics } = dashboardData;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h2>HOD Dashboard - {department}</h2>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Department Overview */}
          <div className="card">
            <h3>Department Overview</h3>
            <div className="department-info">
              <div className="info-item">
                <label>Department:</label>
                <span>{department}</span>
              </div>
              <div className="info-item">
                <label>Total Students:</label>
                <span className="highlight">{statistics.departmentStudents}</span>
              </div>
            </div>
          </div>

          {/* Department Requests */}
          <div className="card">
            <h3>Pending Department Requests</h3>
            <div className="pending-requests">
              <div className="request-item">
                <div className="request-count">{statistics.departmentLeaveRequests}</div>
                <div className="request-label">Leave Requests</div>
                <button className="action-button">Review</button>
              </div>
              <div className="request-item">
                <div className="request-count">{statistics.departmentRoomChanges}</div>
                <div className="request-label">Room Changes</div>
                <button className="action-button">Review</button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card full-width">
            <h3>Department Actions</h3>
            <div className="actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">👥</span>
                <span>View Department Students</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📋</span>
                <span>Review Leave Requests</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🔄</span>
                <span>Review Room Changes</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>Department Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HODDashboard;
