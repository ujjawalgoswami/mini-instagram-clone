import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  localStorage.setItem('token', `Bearer ${res.data.token}`);
  return res.data;
};

export const signup = async (username, email, password) => {
  const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
  localStorage.setItem('token', `Bearer ${res.data.token}`);
  return res.data;
};

// Generic authenticated fetch function
export const authenticatedFetch = async (url, method = 'get', data = null) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("User not authenticated.");

    const config = {
        method,
        url: `${API_URL}${url}`,
        headers: { Authorization: token },
        data
    };
    return (await axios(config)).data;
};
