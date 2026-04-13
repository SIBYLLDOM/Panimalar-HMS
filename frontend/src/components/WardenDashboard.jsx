import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const WardenDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/warden', {
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

  const { statistics, occupancyRate } = dashboardData;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h2>Warden Dashboard</h2>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Hostel Overview */}
          <div className="card">
            <h3>Hostel Overview</h3>
            <div className="stats-grid">
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
                  <span className="occupied">{statistics.occupiedBeds}</span>
                </div>
                <div className="detail-item">
                  <label>Available Beds:</label>
                  <span className="available">{statistics.totalBeds - statistics.occupiedBeds}</span>
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
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card full-width">
            <h3>Hostel Management</h3>
            <div className="actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">🏠</span>
                <span>Manage Hostels</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🏠</span>
                <span>Manage Rooms</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🛏</span>
                <span>Allocate Beds</span>
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
                <span className="action-icon">📊</span>
                <span>Occupancy Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WardenDashboard;
