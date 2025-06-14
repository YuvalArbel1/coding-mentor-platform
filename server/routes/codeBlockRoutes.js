/**
 * Code Block Routes
 * @module routes/codeBlockRoutes
 */

import express from 'express';
import CodeBlockController from '../controllers/codeBlockController.js';

const router = express.Router();

/**
 * @route GET /api/blocks
 * @desc Get all code blocks
 * @access Public
 */
router.get('/', CodeBlockController.getAllCodeBlocks);

/**
 * @route GET /api/blocks/:id
 * @desc Get single code block
 * @access Public
 */
router.get('/:id', CodeBlockController.getCodeBlock);

/**
 * @route POST /api/blocks/:id/check
 * @desc Check if solution is correct
 * @access Public
 */
router.post('/:id/check', CodeBlockController.checkSolution);

export default router;