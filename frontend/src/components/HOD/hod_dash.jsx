import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats } from '../../services/hodService';
import Navbar from '../navbar/navbar';
import LeaveManagement from './LeaveManagement';
import Students from './Students';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import '../../assets/css/hod/hod_dash.css';

const kpiData = [
  { id: 1, title: 'Total Students', value: 420, icon: '🎓', trend: '+12', trendUp: true, color: 'blue' },
  { id: 2, title: 'Students in Hostel', value: 318, icon: '🏠', trend: '+5', trendUp: true, color: 'teal' },
  { id: 4, title: 'Pending Requests', value: 11, icon: '⏳', trend: '+2', trendUp: false, color: 'red' },
  { id: 5, title: 'Available Beds', value: 42, icon: '🛏️', trend: '-5', trendUp: false, color: 'purple' },
];

const weeklyLeaveData = [
  { day: 'Mon', requests: 4 },
  { day: 'Tue', requests: 9 },
  { day: 'Wed', requests: 6 },
  { day: 'Thu', requests: 11 },
  { day: 'Fri', requests: 14 },
  { day: 'Sat', requests: 3 },
  { day: 'Sun', requests: 2 },
];

const monthlyLeaveData = [
  { month: 'Jan', leaves: 28 },
  { month: 'Feb', leaves: 35 },
  { month: 'Mar', leaves: 42 },
  { month: 'Apr', leaves: 31 },
  { month: 'May', leaves: 48 },
  { month: 'Jun', leaves: 22 },
  { month: 'Jul', leaves: 19 },
  { month: 'Aug', leaves: 37 },
  { month: 'Sep', leaves: 45 },
  { month: 'Oct', leaves: 39 },
  { month: 'Nov', leaves: 53 },
  { month: 'Dec', leaves: 29 },
];

const leaveStatusData = [
  { name: 'Approved', value: 68 },
  { name: 'Pending', value: 11 },
  { name: 'Rejected', value: 21 },
];

const STATUS_COLORS = {
  Approved: '#16a34a',
  Pending: '#d97706',
  Rejected: '#dc2626',
};

const hostelBlocks = [
  { name: 'Block A', occupancy: 80, total: 120, occupied: 96 },
  { name: 'Block B', occupancy: 65, total: 100, occupied: 65 },
  { name: 'Block C', occupancy: 90, total: 80, occupied: 72 },
];

const yearData = [
  { year: '1st Year', students: 112 },
  { year: '2nd Year', students: 108 },
  { year: '3rd Year', students: 104 },
  { year: '4th Year', students: 96 },
];

const initialLeaveRequests = [
  { id: 1, name: 'Arjun Mehta', roll: 'CS21001', from: '14 Apr', to: '16 Apr', reason: 'Medical', status: 'Pending' },
  { id: 2, name: 'Priya Sharma', roll: 'CS21042', from: '13 Apr', to: '13 Apr', reason: 'Family Function', status: 'Approved' },
  { id: 3, name: 'Rohit Nair', roll: 'CS22015', from: '15 Apr', to: '18 Apr', reason: 'Fever', status: 'Pending' },
  { id: 4, name: 'Sneha Pillai', roll: 'CS20078', from: '10 Apr', to: '12 Apr', reason: 'Personal', status: 'Rejected' },
  { id: 5, name: 'Karthik Rajan', roll: 'CS23003', from: '16 Apr', to: '17 Apr', reason: 'Medical', status: 'Pending' },
  { id: 6, name: 'Divya Krishnan', roll: 'CS21099', from: '14 Apr', to: '14 Apr', reason: 'Travel', status: 'Approved' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// Internal Dashboard Chart Component
const DashboardHome = ({ time, requests, stats, handleApprove, handleReject, handleApproveAll, handleViewStudents, handleExport, maxStudents, formatDate }) => {
  return (
    <>
      <header className="hod-header">
        <div className="hod-header-left">
          <div className="hod-logo">HMS</div>
          <div>
            <h1 className="hod-title">HOD Dashboard</h1>
            <p className="hod-subtitle">{formatDate(time)}</p>
          </div>
        </div>
        <div className="hod-header-right">
          <div className="hod-profile-info">
            <span className="hod-name">Dr. Ramesh Kumar</span>
            <span className="hod-dept">Computer Science &amp; Engineering</span>
          </div>
          <div className="hod-avatar">RK</div>
        </div>
      </header>

      <main className="hod-main">

        <section className="kpi-grid">
          {kpiData.map(card => {
            let displayValue = card.value;
            let displayTitle = card.title;

            // Dynamically override Total Students from the database via API
            if (card.title === 'Total Students') {
              displayValue = stats?.statistics?.totalStudents !== undefined ? stats.statistics.totalStudents : card.value;
            }
            if (card.title === 'Students in Hostel') {
              displayValue = stats?.statistics?.departmentStudents !== undefined ? stats.statistics.departmentStudents : card.value;
              if (stats?.department) {
                displayTitle = `${stats.department} Students`;
              }
            }
            // You can also override Pending Requests
            if (card.title === 'Pending Requests') {
              displayValue = stats?.statistics?.departmentLeaveRequests !== undefined ? stats.statistics.departmentLeaveRequests : requests.filter(r => r.status === 'Pending').length;
            }

            return (
              <div className={`kpi-card kpi-${card.color}`} key={card.id}>
                <div className="kpi-icon-wrap">
                  <span className="kpi-icon">{card.icon}</span>
                </div>
                <div className="kpi-body">
                  <p className="kpi-label">{displayTitle}</p>
                  <p className="kpi-value">{displayValue}</p>
                  <span className={`kpi-trend ${card.trendUp ? 'trend-up' : 'trend-down'}`}>
                    {card.trendUp ? '▲' : '▼'} {card.trend} this week
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="analytics-grid">
          <div className="analytics-left">
            <div className="chart-card">
              <h2 className="card-heading">Weekly Leave Requests</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyLeaveData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="requests" fill="#1D70B8" radius={[4, 4, 0, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card" style={{ marginTop: '20px' }}>
              <h2 className="card-heading">Monthly Leave Trends</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyLeaveData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="leaves" stroke="#0B3C5D" strokeWidth={2.5} dot={{ r: 4, fill: '#0B3C5D' }} name="Leaves" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-right">
            <div className="chart-card">
              <h2 className="card-heading">Leave Status</h2>
              <div className="donut-legend">
                {leaveStatusData.map(s => (
                  <span key={s.name} className="legend-item">
                    <span className="legend-dot" style={{ background: STATUS_COLORS[s.name] }}></span>
                    {s.name} <strong>{s.value}</strong>
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={leaveStatusData}
                    cx="50%" cy="50%"
                    innerRadius={58} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leaveStatusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card" style={{ marginTop: '20px' }}>
              <h2 className="card-heading">Hostel Occupancy</h2>
              <div className="occupancy-list">
                {hostelBlocks.map(block => (
                  <div key={block.name} className="occupancy-row">
                    <div className="occupancy-meta">
                      <span className="occupancy-name">{block.name}</span>
                      <span className="occupancy-pct">{block.occupancy}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill occ-${block.occupancy >= 85 ? 'high' : block.occupancy >= 70 ? 'mid' : 'low'}`}
                        style={{ width: `${block.occupancy}%` }}
                      ></div>
                    </div>
                    <p className="occupancy-sub">{block.occupied} / {block.total} beds occupied</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="insights-grid">
          <div className="chart-card insights-year">
            <h2 className="card-heading">Students by Year</h2>
            <div className="year-bars">
              {yearData.map(y => (
                <div key={y.year} className="year-row">
                  <span className="year-label">{y.year}</span>
                  <div className="year-track">
                    <div
                      className="year-fill"
                      style={{ width: `${(y.students / maxStudents) * 100}%` }}
                    ></div>
                  </div>
                  <span className="year-count">{y.students}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card quick-actions-card">
            <h2 className="card-heading">Quick Actions</h2>
            <div className="quick-actions">
              <button className="action-btn action-primary" onClick={handleApproveAll}>
                <span>✔</span> Approve All Pending
              </button>
              <button className="action-btn action-secondary" onClick={handleViewStudents}>
                <span>👥</span> View All Students
              </button>
              <button className="action-btn action-outline" onClick={handleExport}>
                <span>⬇</span> Export Leave Data
              </button>
            </div>
            <div className="quick-stats">
              <div className="qs-item">
                <span className="qs-num pending-color">{requests.filter(r => r.status === 'Pending').length}</span>
                <span className="qs-label">Pending</span>
              </div>
              <div className="qs-divider"></div>
              <div className="qs-item">
                <span className="qs-num approved-color">{requests.filter(r => r.status === 'Approved').length}</span>
                <span className="qs-label">Approved</span>
              </div>
              <div className="qs-divider"></div>
              <div className="qs-item">
                <span className="qs-num rejected-color">{requests.filter(r => r.status === 'Rejected').length}</span>
                <span className="qs-label">Rejected</span>
              </div>
            </div>
          </div>
        </section>

        <section className="table-section">
          <div className="chart-card">
            <div className="table-header">
              <h2 className="card-heading" style={{ margin: 0 }}>Recent Leave Requests</h2>
              <span className="table-badge">{requests.length} total</span>
            </div>
            <div className="table-wrap">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No.</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td className="student-name">{r.name}</td>
                      <td className="roll-num">{r.roll}</td>
                      <td>{r.from}</td>
                      <td>{r.to}</td>
                      <td>{r.reason}</td>
                      <td>
                        <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="tbl-btn tbl-approve"
                            disabled={r.status !== 'Pending'}
                            onClick={() => handleApprove(r.id)}
                          >Approve</button>
                          <button
                            className="tbl-btn tbl-reject"
                            disabled={r.status !== 'Pending'}
                            onClick={() => handleReject(r.id)}
                          >Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState(initialLeaveRequests);
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleApprove = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };
  const handleReject = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };
  const handleApproveAll = () => {
    setRequests(prev => prev.map(r => r.status === 'Pending' ? { ...r, status: 'Approved' } : r));
  };
  const handleViewStudents = () => {};
  const handleExport = () => {};

  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const maxStudents = Math.max(...yearData.map(y => y.students));

  return (
    <div className="hod-layout">
      {/* 1) Fixed Sidebar */}
      <Navbar onLogout={logout} />
      
      {/* 2) Main Route Area - pushes right from sidebar */}
      <div className="hod-layout-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', paddingLeft: '0' }}>
        <style>{`.hod-layout:has(.hod-navbar.collapsed) .hod-layout-content { margin-left: -180px; }`}</style>
        <div className="hod-dashboard" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <Routes>
            <Route path="/" element={
              <DashboardHome 
                time={time} 
                requests={requests} 
                stats={stats}
                handleApprove={handleApprove} 
                handleReject={handleReject} 
                handleApproveAll={handleApproveAll} 
                handleViewStudents={handleViewStudents} 
                handleExport={handleExport}
                maxStudents={maxStudents}
                formatDate={formatDate}
              />
            } />
            
            <Route path="/leaves" element={
              <>
                <header className="hod-header">
                  <div className="hod-header-left">
                    <div><h1 className="hod-title">Leave Management</h1></div>
                  </div>
                </header>
                <main className="hod-main"><LeaveManagement /></main>
              </>
            } />

            <Route path="/students" element={
              <>
                <header className="hod-header">
                  <div className="hod-header-left">
                    <div><h1 className="hod-title">Department Students</h1></div>
                  </div>
                </header>
                <main className="hod-main"><Students /></main>
              </>
            } />

            <Route path="*" element={<main className="hod-main"><h2>Module Under Development</h2></main>} />
          </Routes>

        </div>
      </div>
    </div>
  );
}