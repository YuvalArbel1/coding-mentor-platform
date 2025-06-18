/**
 * API Service Module
 *
 * This module handles all HTTP requests to the backend API.
 * It provides a centralized way to communicate with the server
 * and includes error handling for all API calls.
 *
 * @module services/api
 */

import axios from 'axios';

/**
 * Base URL for API requests
 * Uses environment variable if available, otherwise defaults to localhost
 * @constant {string}
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
/**
 * Axios instance with default configuration
 * @constant {AxiosInstance}
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Code Block API methods
 * @namespace codeBlockAPI
 */
export const codeBlockAPI = {
    /**
     * Fetch all available code blocks
     * @async
     * @function getAllBlocks
     * @returns {Promise<Object>} Response containing array of code blocks
     * @throws {Error} When the API request fails
     *
     */
    getAllBlocks: async () => {
        try {
            const response = await api.get('/blocks');
            return response.data;
        } catch (error) {
            console.error('Error fetching code blocks:', error);
            throw error;
        }
    },

    /**
     * Fetch a specific code block by ID
     * @async
     * @function getBlockById
     * @param {string|number} id - The code block ID
     * @returns {Promise<Object>} Response containing the code block data
     * @throws {Error} When the API request fails or block not found
     *
     */
    getBlockById: async (id) => {
        try {
            const response = await api.get(`/blocks/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching code block ${id}:`, error);
            throw error;
        }
    },

    /**
     * Check if submitted code matches the solution
     * @async
     * @function checkSolution
     * @param {string|number} id - The code block ID
     * @param {string} code - The code to check against the solution
     * @returns {Promise<Object>} Response with isCorrect boolean
     * @throws {Error} When the API request fails
     *
     */
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

/**
 * Default export of the configured axios instance
 * Can be used for custom API calls if needed
 */
export default api;