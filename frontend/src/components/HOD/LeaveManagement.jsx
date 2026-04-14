import React, { useEffect, useState } from 'react';
import { getLeaveRequests, approveLeave, rejectLeave } from '../../services/hodService';
import '../../assets/css/hod/table.css';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLeaves = async () => {
    try {
      const data = await getLeaveRequests();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this leave?')) {
      try {
        await approveLeave(id);
        fetchLeaves(); // refresh list
      } catch (error) {
        console.error('Error approving leave:', error);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this leave?')) {
      try {
        await rejectLeave(id);
        fetchLeaves(); // refresh list
      } catch (error) {
        console.error('Error rejecting leave:', error);
      }
    }
  };

  const filteredLeaves = leaves.filter(leave => 
    filter === 'all' ? true : leave.status === filter
  );

  if (loading) return <div>Loading leaves...</div>;

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Leave Requests</h2>
        <div className="table-filters">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.student_name}</td>
                <td>{leave.roll_no}</td>
                <td>{new Date(leave.from_date).toLocaleDateString()}</td>
                <td>{new Date(leave.to_date).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status-badge status-${leave.status}`}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn btn-approve"
                        onClick={() => handleApprove(leave.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="action-btn btn-reject"
                        onClick={() => handleReject(leave.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredLeaves.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement;
