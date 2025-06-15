/**
 * Hint Service - Business logic for hint system
 * @module services/hintService
 */

import pool from '../config/database.js';
import Logger from '../utils/logger.js';

class HintService {
    /**
     * Track hint requests per student per code block
     * Structure: { 'blockId-studentId': { count: number, lastRequest: Date } }
     */
    static hintRequests = new Map();

    /**
     * Get hints for a specific code block
     * @param {number} codeBlockId - Code block ID
     * @returns {Promise<Array>} Array of hints
     */
    static async getHintsByCodeBlock(codeBlockId) {
        try {
            const query = `
                SELECT id, level, content
                FROM hints
                WHERE code_block_id = $1
                ORDER BY CASE level
                             WHEN 'basic' THEN 1
                             WHEN 'medium' THEN 2
                             WHEN 'advanced' THEN 3
                             END
            `;
            const result = await pool.query(query, [codeBlockId]);
            Logger.info(`Retrieved ${result.rows.length} hints for code block ${codeBlockId}`);
            return result.rows;
        } catch (error) {
            Logger.error('Failed to get hints', error);
            throw new Error('Failed to retrieve hints');
        }
    }

    /**
     * Get a specific hint
     * @param {number} hintId - Hint ID
     * @returns {Promise<Object>} Hint object
     */
    static async getHintById(hintId) {
        try {
            const query = 'SELECT * FROM hints WHERE id = $1';
            const result = await pool.query(query, [hintId]);

            if (result.rows.length === 0) {
                throw new Error('Hint not found');
            }

            return result.rows[0];
        } catch (error) {
            Logger.error(`Failed to get hint ${hintId}`, error);
            throw error;
        }
    }

    /**
     * Track sent hints per student per code block
     * Structure: { 'blockId-studentId': Set<hintId> }
     */
    static sentHints = new Map();

    /**
     * Track hint request from student
     * @param {string} blockId - Code block ID
     * @param {string} studentId - Student socket ID
     * @returns {number} Request count for this student
     */
    static trackHintRequest(blockId, studentId) {
        const key = `${blockId}-${studentId}`;
        const existing = this.hintRequests.get(key) || {count: 0, lastRequest: null};

        existing.count += 1;
        existing.lastRequest = new Date();

        this.hintRequests.set(key, existing);
        Logger.info(`Student ${studentId} requested hint #${existing.count} for block ${blockId}`);

        return existing.count;
    }

    /**
     * Record that a hint was sent
     * @param {string} blockId - Code block ID
     * @param {string} studentId - Student socket ID
     * @param {number} hintId - Hint ID
     */
    static recordSentHint(blockId, studentId, hintId) {
        const key = `${blockId}-${studentId}`;
        if (!this.sentHints.has(key)) {
            this.sentHints.set(key, new Set());
        }
        this.sentHints.get(key).add(hintId);
        Logger.info(`Recorded hint ${hintId} sent to student ${studentId} for block ${blockId}`);
    }

    /**
     * Get sent hints for a student
     * @param {string} blockId - Code block ID
     * @param {string} studentId - Student socket ID
     * @returns {Set<number>} Set of sent hint IDs
     */
    static getSentHints(blockId, studentId) {
        const key = `${blockId}-${studentId}`;
        return this.sentHints.get(key) || new Set();
    }

    /**
     * Check if student can request more hints
     * @param {string} blockId - Code block ID
     * @param {string} studentId - Student socket ID
     * @returns {boolean} True if can request more hints
     */
    static canRequestMoreHints(blockId, studentId) {
        const sentHints = this.getSentHints(blockId, studentId);
        return sentHints.size < 3; // Max 3 hints
    }

    /**
     * Get hint request count for a student
     * @param {string} blockId - Code block ID
     * @param {string} studentId - Student socket ID
     * @returns {number} Number of hint requests
     */
    static getHintRequestCount(blockId, studentId) {
        const key = `${blockId}-${studentId}`;
        const data = this.hintRequests.get(key);
        return data ? data.count : 0;
    }

    /**
     * Clear hint requests for a room (when room is cleared)
     * @param {string} blockId - Code block ID
     */
    static clearHintRequests(blockId) {
        // Remove all entries that start with this blockId
        for (const key of this.hintRequests.keys()) {
            if (key.startsWith(`${blockId}-`)) {
                this.hintRequests.delete(key);
            }
        }
        Logger.info(`Cleared hint requests for block ${blockId}`);
    }

    /**
     * Get recommended hint level based on request count
     * @param {number} requestCount - Number of hint requests
     * @returns {string} Recommended hint level
     */
    static getRecommendedHintLevel(requestCount) {
        if (requestCount <= 1) return 'basic';
        if (requestCount === 2) return 'medium';
        return 'advanced';
    }
}

export default HintService;