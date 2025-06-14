/**
 * Code Block Controller - Handles HTTP requests for code blocks
 * @module controllers/codeBlockController
 */

import CodeBlockService from '../services/codeBlockService.js';
import Logger from '../utils/logger.js';

class CodeBlockController {
    /**
     * Get all code blocks
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    static async getAllCodeBlocks(req, res) {
        try {
            const codeBlocks = await CodeBlockService.getAllCodeBlocks();
            res.json({
                success: true,
                data: codeBlocks,
                count: codeBlocks.length
            });
        } catch (error) {
            Logger.error('Controller: Failed to get code blocks', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get single code block
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    static async getCodeBlock(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid code block ID'
                });
            }

            const codeBlock = await CodeBlockService.getCodeBlockById(parseInt(id));

            res.json({
                success: true,
                data: codeBlock
            });
        } catch (error) {
            const statusCode = error.message === 'Code block not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Check solution
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    static async checkSolution(req, res) {
        try {
            const { id } = req.params;
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({
                    success: false,
                    error: 'Code is required'
                });
            }

            const isCorrect = await CodeBlockService.checkSolution(parseInt(id), code);

            res.json({
                success: true,
                isCorrect
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default CodeBlockController;