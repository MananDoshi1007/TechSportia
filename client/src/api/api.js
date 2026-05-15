import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5179/api",
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ts_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post("/User/login", data),
  register: (data) => API.post("/User/register", data),
};

export const userAPI = {
  getProfile: (id) => API.get(`/User/${id}`),
  update: (id, data) => API.put(`/User/${id}`, data),
  changePassword: (data) => API.post("/User/change-password", data),
  assignRole: (data) => API.post("/User/assign-role", data),
  delete: (id) => API.delete(`/User/${id}`),
  getAll: () => API.get("/User"),
  search: (query) => API.get(query ? `/User/search?query=${query}` : "/User/search"),
};

export const collegeAPI = {
  getAll: () => API.get("/College"),
  getPublicList: () => API.get("/College/public-list"),
  create: (data) => API.post("/College", data),
  toggleApproval: (id) => API.patch(`/College/${id}/toggle-approval`),
  delete: (id) => API.delete(`/College/${id}`),
};

export const eventAPI = {
  getAll: (q) => API.get(q ? `/Event?q=${q}` : "/Event"),
  getByCollege: (collegeId) => API.get(`/Event/college/${collegeId}`),
  create: (data) => API.post("/Event", data),
  update: (id, data) => API.put(`/Event/${id}`, data),
  delete: (id) => API.delete(`/Event/${id}`),
  updateStatus: (id, status) => API.patch(`/Event/${id}/status?status=${status}`),
  getOrganizerStats: () => API.get("/Event/organizer-stats"),
  getGlobalStats: () => API.get("/Event/stats"),
};

export const sportAPI = {
  getAll: () => API.get("/Sport"),
  getByEvent: (eventId) => API.get(`/Sport/event/${eventId}`),
  create: (data) => API.post("/Sport", data),
  update: (id, data) => API.put(`/Sport/${id}`, data),
  delete: (id) => API.delete(`/Sport/${id}`),
};

export const teamAPI = {
  create: (name, sportId) => API.post(`/Team?teamName=${encodeURIComponent(name)}&sportId=${sportId}`),
  getById: (id) => API.get(`/Team/${id}`),
  withdraw: (teamId) => API.put(`/Team/withdraw/${teamId}`),
  getMyTeamBySport: (sportId) => API.get(`/Team/sport/${sportId}/my`),
  register: (teamId) => API.put(`/Team/register/${teamId}`),
  addMember: (teamId, userId) => API.post(`/Team/add-member?teamId=${teamId}&userId=${userId}`),
  removeMember: (teamId, userId) => API.delete(`/Team/remove-member?teamId=${teamId}&userId=${userId}`),
  getMyTeams: () => API.get("/Team/my"),
  getCollegeTeams: () => API.get("/Team/college"),
  getBySport: (sportId) => API.get(`/Team/sport/${sportId}`),
  approve: (teamId) => API.put(`/Team/approve/${teamId}`),
  reject: (teamId) => API.delete(`/Team/${teamId}`),
};

export const registrationAPI = {
  registerIndividual: (sportId) => API.post(`/Registration?sportId=${sportId}`),
  getMyRegistrations: () => API.get("/Registration/my"),
  getParticipants: (sportId) => API.get(`/Registration/sport/${sportId}`),
  getCollegeRegistrations: () => API.get("/Registration/college"),
  approve: (id) => API.put(`/Registration/approve/${id}`),
  reject: (id) => API.delete(`/Registration/${id}`),
};

export const scoreAPI = {
  update: (sportId, type, id, points) => {
    const idParam = type === 'team' ? 'teamId' : 'userId';
    return API.post(`/Score/update?sportId=${sportId}&${idParam}=${id}&points=${points}`);
  },
  bulkUpdate: (scores) => API.post("/Score/bulk-update", scores),
  getBySport: (sportId) => API.get(`/Score/sport/${sportId}`),
};

export const resultAPI = {
  getByEvent: (eventId) => API.get(`/Result/event/${eventId}`),
  publish: (data) => API.post("/Result/publish", data),
  bulkPublish: (data) => API.post("/Result/bulk-publish", data),
};

export default API;
