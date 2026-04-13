import React, { useState, useEffect } from 'react';
import './HostelManagement.css';

const HostelManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'boys',
    block: '',
    year_category: '1st_year'
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hostels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setHostels(data);
      } else {
        console.error('Failed to fetch hostels:', data.error);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingHostel 
        ? `http://localhost:5000/api/hostels/${editingHostel.id}`
        : 'http://localhost:5000/api/hostels';
      
      const method = editingHostel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchHostels();
        resetForm();
        alert(editingHostel ? 'Hostel updated successfully!' : 'Hostel created successfully!');
      } else {
        alert(data.error || 'Failed to save hostel');
      }
    } catch (error) {
      console.error('Error saving hostel:', error);
      alert('Failed to save hostel');
    }
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      type: hostel.type,
      block: hostel.block,
      year_category: hostel.year_category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hostel?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchHostels();
        alert('Hostel deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete hostel');
      }
    } catch (error) {
      console.error('Error deleting hostel:', error);
      alert('Failed to delete hostel');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'boys',
      block: '',
      year_category: '1st_year'
    });
    setEditingHostel(null);
    setShowForm(false);
  };

  const getHostelTypeColor = (type) => {
    return type === 'boys' ? '#3b82f6' : '#ec4899';
  };

  const getYearCategoryBadge = (category) => {
    const badges = {
      '1st_year': { color: '#10b981', text: '1st Year' },
      '2nd_year': { color: '#f59e0b', text: '2nd Year' },
      '3rd_year': { color: '#8b5cf6', text: '3rd Year' },
      '4th_year': { color: '#ef4444', text: '4th Year' },
      'all_years': { color: '#6b7280', text: 'All Years' }
    };
    return badges[category] || badges['all_years'];
  };

  if (loading) {
    return (
      <div className="hostel-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hostel-management">
      <div className="section-header">
        <h2>Hostel Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add New Hostel
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</h3>
              <button onClick={resetForm} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="hostel-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Hostel Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Boys Block A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hostel Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="boys">Boys Hostel</option>
                    <option value="girls">Girls Hostel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Block Name *</label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => setFormData({...formData, block: e.target.value})}
                    placeholder="e.g., Block A, Block B"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Year Category *</label>
                  <select
                    value={formData.year_category}
                    onChange={(e) => setFormData({...formData, year_category: e.target.value})}
                    required
                  >
                    <option value="1st_year">1st Year</option>
                    <option value="2nd_year">2nd Year</option>
                    <option value="3rd_year">3rd Year</option>
                    <option value="4th_year">4th Year</option>
                    <option value="all_years">All Years</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingHostel ? 'Update Hostel' : 'Create Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hostels-grid">
        {hostels.map((hostel) => {
          const yearBadge = getYearCategoryBadge(hostel.year_category);
          return (
            <div key={hostel.id} className="hostel-card">
              <div className="hostel-header">
                <div className="hostel-type" style={{ backgroundColor: getHostelTypeColor(hostel.type) }}>
                  <span className="type-icon">
                    {hostel.type === 'boys' ? '👦' : '👧'}
                  </span>
                  <span className="type-text">{hostel.type === 'boys' ? 'Boys' : 'Girls'}</span>
                </div>
                <div className="hostel-actions">
                  <button 
                    onClick={() => handleEdit(hostel)}
                    className="action-btn edit"
                    title="Edit Hostel"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(hostel.id)}
                    className="action-btn delete"
                    title="Delete Hostel"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="hostel-body">
                <h3 className="hostel-name">{hostel.name}</h3>
                <div className="hostel-info">
                  <div className="info-item">
                    <span className="info-label">Block:</span>
                    <span className="info-value">{hostel.block}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Category:</span>
                    <span 
                      className="year-badge"
                      style={{ backgroundColor: yearBadge.color }}
                    >
                      {yearBadge.text}
                    </span>
                  </div>
                </div>

                <div className="hostel-stats">
                  <div className="stat">
                    <span className="stat-number">{hostel.total_rooms || 0}</span>
                    <span className="stat-label">Rooms</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{hostel.total_beds || 0}</span>
                    <span className="stat-label">Beds</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{hostel.available_beds || 0}</span>
                    <span className="stat-label">Available</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hostels.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No Hostels Found</h3>
          <p>Start by adding your first hostel to the system.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add First Hostel
          </button>
        </div>
      )}
    </div>
  );
};

export default HostelManagement;
