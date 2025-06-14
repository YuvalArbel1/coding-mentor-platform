import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Code Block API calls
export const codeBlockAPI = {
    // Get all code blocks
    getAllBlocks: async () => {
        try {
            const response = await api.get('/blocks');
            return response.data;
        } catch (error) {
            console.error('Error fetching code blocks:', error);
            throw error;
        }
    },

    // Get single code block
    getBlockById: async (id) => {
        try {
            const response = await api.get(`/blocks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching code block ${id}:`, error);
            throw error;
        }
    },

    // Check solution
    checkSolution: async (id, code) => {
        try {
            const response = await api.post(`/blocks/${id}/check`, {code});
            return response.data;
        } catch (error) {
            console.error('Error checking solution:', error);
            throw error;
        }
    },
};

export default api;