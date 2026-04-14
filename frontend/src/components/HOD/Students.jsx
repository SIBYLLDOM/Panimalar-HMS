import React, { useEffect, useState } from 'react';
import { getStudentsByDept } from '../../services/hodService';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/css/hod/table.css';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (user?.department) {
          const data = await getStudentsByDept(user.department);
          setStudents(data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Department Students ({user?.department})</h2>
        <div className="table-filters">
          <input 
            type="text" 
            placeholder="Search by name or roll no..." 
            className="filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Email</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.roll_no}</td>
                <td>{student.student_email || student.user_email}</td>
                <td>{student.father_phone || 'N/A'}</td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
