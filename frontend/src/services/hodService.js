import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getDashboardStats = async () => {
  const response = await axios.get(`${BASE_URL}/dashboard/hod`, getHeaders());
  return response.data;
};

export const getLeaveRequests = async () => {
  const response = await axios.get(`${BASE_URL}/leave`, getHeaders());
  return response.data;
};

export const approveLeave = async (id) => {
  const response = await axios.put(`${BASE_URL}/leave/${id}/approve`, {}, getHeaders());
  return response.data;
};

export const rejectLeave = async (id) => {
  const response = await axios.put(`${BASE_URL}/leave/${id}/reject`, {}, getHeaders());
  return response.data;
};

export const getStudentsByDept = async (dept) => {
  // Can get all students, but backend handles filtering for department
  // We actually need `getStudentsByDept` specifically, let's use the department route
  const response = await axios.get(`${BASE_URL}/students/department/${dept}`, getHeaders());
  return response.data;
};
