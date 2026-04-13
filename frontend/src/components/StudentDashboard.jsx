import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/student', {
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

  const { student, room, recentLeaveRequests, billingSummary } = dashboardData;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h2>Welcome, {student.name}</h2>
            <p>Roll No: {student.roll_no} | Department: {student.department}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Student Info Card */}
          <div className="card">
            <h3>Student Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Roll Number:</label>
                <span>{student.roll_no}</span>
              </div>
              <div className="info-item">
                <label>Department:</label>
                <span>{student.department}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{student.student_email || student.email}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{new Date(student.dob).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Room Allocation Card */}
          <div className="card">
            <h3>Room Allocation</h3>
            {room ? (
              <div className="room-info">
                <div className="info-item">
                  <label>Hostel:</label>
                  <span>{room.hostel_name} ({room.hostel_type})</span>
                </div>
                <div className="info-item">
                  <label>Room:</label>
                  <span>{room.room_number}</span>
                </div>
                <div className="info-item">
                  <label>Bed:</label>
                  <span>{room.bed_number}</span>
                </div>
              </div>
            ) : (
              <div className="no-room">
                <p>No room allocated yet</p>
                <button className="action-button">Request Room</button>
              </div>
            )}
          </div>

          {/* Billing Summary Card */}
          <div className="card">
            <h3>Billing Summary</h3>
            <div className="billing-stats">
              <div className="stat-item">
                <label>Total Amount:</label>
                <span className="amount">₹{billingSummary.total_amount || 0}</span>
              </div>
              <div className="stat-item paid">
                <label>Paid:</label>
                <span className="amount">₹{billingSummary.total_paid || 0}</span>
              </div>
              <div className="stat-item unpaid">
                <label>Unpaid:</label>
                <span className="amount">₹{billingSummary.total_unpaid || 0}</span>
              </div>
            </div>
            <button className="action-button">View All Bills</button>
          </div>

          {/* Recent Leave Requests */}
          <div className="card full-width">
            <h3>Recent Leave Requests</h3>
            {recentLeaveRequests.length > 0 ? (
              <div className="leave-list">
                {recentLeaveRequests.map((leave) => (
                  <div key={leave.id} className={`leave-item ${leave.status}`}>
                    <div className="leave-details">
                      <div className="leave-dates">
                        {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                      </div>
                      <div className="leave-reason">{leave.reason}</div>
                    </div>
                    <div className={`leave-status ${leave.status}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-leave">
                <p>No leave requests found</p>
                <button className="action-button">Request Leave</button>
              </div>
            )}
            <button className="action-button">View All Requests</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
