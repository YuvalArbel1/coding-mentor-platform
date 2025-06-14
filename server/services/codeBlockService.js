/**
 * Code Block Service - Business logic for code blocks
 * @module services/codeBlockService
 */

import pool from '../config/database.js';
import Logger from '../utils/logger.js';

class CodeBlockService {
    /**
     * Get all code blocks
     * @returns {Promise<Array>} Array of code blocks
     * @throws {Error} Database error
     */
    static async getAllCodeBlocks() {
        try {
            const query = 'SELECT id, title, description FROM code_blocks ORDER BY id';
            const result = await pool.query(query);
            Logger.info(`Retrieved ${result.rows.length} code blocks`);
            return result.rows;
        } catch (error) {
            Logger.error('Failed to get code blocks', error);
            throw new Error('Failed to retrieve code blocks');
        }
    }

    /**
     * Get code block by ID
     * @param {number} id - Code block ID
     * @returns {Promise<Object>} Code block object
     * @throws {Error} Not found or database error
     */
    static async getCodeBlockById(id) {
        try {
            const query = 'SELECT * FROM code_blocks WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('Code block not found');
            }

            Logger.info(`Retrieved code block with id: ${id}`);
            return result.rows[0];
        } catch (error) {
            Logger.error(`Failed to get code block ${id}`, error);
            throw error;
        }
    }

    /**
     * Check if code matches solution
     * @param {number} blockId - Code block ID
     * @param {string} code - Student's code
     * @returns {Promise<boolean>} True if matches solution
     */
    static async checkSolution(blockId, code) {
        try {
            const block = await this.getCodeBlockById(blockId);

            // Normalize code for comparison (remove extra spaces, newlines)
            const normalizeCode = (str) => str.replace(/\s+/g, ' ').trim();

            const isMatch = normalizeCode(code) === normalizeCode(block.solution);

            if (isMatch) {
                Logger.info(`Solution matched for block ${blockId}`);
            }

            return isMatch;
        } catch (error) {
            Logger.error('Failed to check solution', error);
            throw error;
        }
    }
}

export default CodeBlockService;