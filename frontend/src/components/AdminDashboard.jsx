import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
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
          <p>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const { statistics, occupancyRate } = dashboardData;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h2>Admin Dashboard</h2>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Overview Stats */}
          <div className="card overview-card">
            <h3>System Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{statistics.totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{statistics.totalHostels}</div>
                <div className="stat-label">Total Hostels</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{statistics.totalRooms}</div>
                <div className="stat-label">Total Rooms</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{statistics.totalBeds}</div>
                <div className="stat-label">Total Beds</div>
              </div>
            </div>
          </div>

          {/* Occupancy Stats */}
          <div className="card">
            <h3>Occupancy Statistics</h3>
            <div className="occupancy-info">
              <div className="occupancy-circle">
                <div className="occupancy-percentage">{occupancyRate}%</div>
                <div className="occupancy-label">Occupancy Rate</div>
              </div>
              <div className="occupancy-details">
                <div className="detail-item">
                  <label>Occupied Beds:</label>
                  <span>{statistics.occupiedBeds}</span>
                </div>
                <div className="detail-item">
                  <label>Total Beds:</label>
                  <span>{statistics.totalBeds}</span>
                </div>
                <div className="detail-item">
                  <label>Available Beds:</label>
                  <span>{statistics.totalBeds - statistics.occupiedBeds}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="card">
            <h3>Pending Requests</h3>
            <div className="pending-requests">
              <div className="request-item">
                <div className="request-count">{statistics.pendingLeaveRequests}</div>
                <div className="request-label">Leave Requests</div>
                <button className="action-button">Review</button>
              </div>
              <div className="request-item">
                <div className="request-count">{statistics.pendingRoomChanges}</div>
                <div className="request-label">Room Changes</div>
                <button className="action-button">Review</button>
              </div>
              <div className="request-item">
                <div className="request-count">{statistics.unpaidBills}</div>
                <div className="request-label">Unpaid Bills</div>
                <button className="action-button">Review</button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card full-width">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">👥</span>
                <span>Manage Students</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🏠</span>
                <span>Manage Hostels</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🏠</span>
                <span>Manage Rooms</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">💰</span>
                <span>Manage Billing</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📋</span>
                <span>Leave Requests</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🔄</span>
                <span>Room Changes</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">👤</span>
                <span>Manage Users</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>Generate Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
