import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    capacity: ''
  });
  
  const [bedFormData, setBedFormData] = useState({
    number_of_beds: ''
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      fetchRooms(selectedHostel.id);
    }
  }, [selectedHostel]);

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

  const fetchRooms = async (hostelId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/${hostelId}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setRooms(data);
      } else {
        console.error('Failed to fetch rooms:', data.error);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/${selectedHostel.id}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomFormData),
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchRooms(selectedHostel.id);
        setShowRoomForm(false);
        setRoomFormData({ room_number: '', capacity: '' });
        alert('Room created successfully!');
      } else {
        alert(data.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const handleCreateBeds = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/rooms/${selectedRoom.id}/beds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bedFormData),
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchRooms(selectedHostel.id);
        setShowBedForm(false);
        setBedFormData({ number_of_beds: '' });
        setSelectedRoom(null);
        alert(`${data.beds_created} beds created successfully!`);
      } else {
        alert(data.error || 'Failed to create beds');
      }
    } catch (error) {
      console.error('Error creating beds:', error);
      alert('Failed to create beds');
    }
  };

  const getOccupancyColor = (occupied, total) => {
    const percentage = total > 0 ? (occupied / total) * 100 : 0;
    if (percentage === 0) return '#10b981';
    if (percentage < 50) return '#3b82f6';
    if (percentage < 80) return '#f59e0b';
    return '#ef4444';
  };

  const getOccupancyStatus = (occupied, total) => {
    const percentage = total > 0 ? (occupied / total) * 100 : 0;
    if (percentage === 0) return 'Available';
    if (percentage < 50) return 'Low Occupancy';
    if (percentage < 80) return 'Medium Occupancy';
    return 'High Occupancy';
  };

  if (loading) {
    return (
      <div className="room-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading room management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-management">
      <div className="section-header">
        <h2>Room & Bed Management</h2>
      </div>

      <div className="hostel-selector">
        <label>Select Hostel:</label>
        <select 
          value={selectedHostel?.id || ''} 
          onChange={(e) => {
            const hostel = hostels.find(h => h.id === parseInt(e.target.value));
            setSelectedHostel(hostel);
          }}
        >
          <option value="">Choose a hostel...</option>
          {hostels.map(hostel => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name} ({hostel.type === 'boys' ? 'Boys' : 'Girls'} - {hostel.block})
            </option>
          ))}
        </select>
      </div>

      {selectedHostel && (
        <>
          <div className="hostel-info">
            <div className="info-card">
              <h3>{selectedHostel.name}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Type:</span>
                  <span className={`value ${selectedHostel.type}`}>
                    {selectedHostel.type === 'boys' ? '👦 Boys' : '👧 Girls'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Block:</span>
                  <span className="value">{selectedHostel.block}</span>
                </div>
                <div className="info-item">
                  <span className="label">Category:</span>
                  <span className="value">{selectedHostel.year_category?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={() => setShowRoomForm(true)}
              >
                <span className="btn-icon">➕</span>
                Add Room
              </button>
            </div>
          </div>

          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h4>Room {room.room_number}</h4>
                  <div className="room-actions">
                    <button 
                      className="bed-btn"
                      onClick={() => {
                        setSelectedRoom(room);
                        setBedFormData({ number_of_beds: '' });
                        setShowBedForm(true);
                      }}
                    >
                      <span className="btn-icon">🛏</span>
                      Add Beds
                    </button>
                  </div>
                </div>

                <div className="room-body">
                  <div className="room-stats">
                    <div className="stat">
                      <span className="stat-number">{room.capacity}</span>
                      <span className="stat-label">Capacity</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{room.beds?.length || 0}</span>
                      <span className="stat-label">Total Beds</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{room.occupied_beds || 0}</span>
                      <span className="stat-label">Occupied</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{(room.beds?.length || 0) - (room.occupied_beds || 0)}</span>
                      <span className="stat-label">Available</span>
                    </div>
                  </div>

                  <div className="occupancy-indicator">
                    <div 
                      className="occupancy-bar"
                      style={{
                        width: `${room.beds?.length > 0 ? ((room.occupied_beds || 0) / room.beds.length) * 100 : 0}%`,
                        backgroundColor: getOccupancyColor(room.occupied_beds || 0, room.beds?.length || 0)
                      }}
                    ></div>
                    <span className="occupancy-text">
                      {getOccupancyStatus(room.occupied_beds || 0, room.beds?.length || 0)}
                    </span>
                  </div>

                  {room.beds && room.beds.length > 0 && (
                    <div className="beds-list">
                      <h5>Beds ({room.beds.length})</h5>
                      <div className="beds-grid">
                        {room.beds.map(bed => (
                          <div 
                            key={bed.id} 
                            className={`bed-item ${bed.is_occupied ? 'occupied' : 'available'}`}
                          >
                            <span className="bed-number">Bed {bed.bed_number}</span>
                            <span className="bed-status">
                              {bed.is_occupied ? '👤 Occupied' : '✓ Available'}
                            </span>
                            {bed.student_name && (
                              <span className="student-name">{bed.student_name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>No Rooms Found</h3>
              <p>This hostel doesn't have any rooms yet.</p>
              <button 
                onClick={() => setShowRoomForm(true)}
                className="btn-primary"
              >
                Add First Room
              </button>
            </div>
          )}
        </>
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Room</h3>
              <button onClick={() => setShowRoomForm(false)} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleCreateRoom} className="room-form">
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={roomFormData.room_number}
                  onChange={(e) => setRoomFormData({...roomFormData, room_number: e.target.value})}
                  placeholder="e.g., 101, 102, A-101"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bed Capacity *</label>
                <input
                  type="number"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({...roomFormData, capacity: e.target.value})}
                  placeholder="Maximum number of beds"
                  min="1"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowRoomForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bed Form Modal */}
      {showBedForm && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Beds to Room {selectedRoom.room_number}</h3>
              <button onClick={() => setShowBedForm(false)} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleCreateBeds} className="bed-form">
              <div className="form-group">
                <label>Number of Beds *</label>
                <input
                  type="number"
                  value={bedFormData.number_of_beds}
                  onChange={(e) => setBedFormData({...bedFormData, number_of_beds: e.target.value})}
                  placeholder="How many beds to add?"
                  min="1"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowBedForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add {bedFormData.number_of_beds || ''} Beds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
