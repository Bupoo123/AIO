const express = require('express');
const router = express.Router();
const {
  getTools,
  createTool,
  getToolById,
  updateTool,
  deleteTool,
  getAllTools
} = require('../controllers/toolController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateToolCreate,
  validateToolUpdate
} = require('../middleware/validation');

// 获取工具列表（公开）
router.get('/', getTools);

// 获取工具详情（公开）
router.get('/:id', getToolById);

// 创建工具（管理员功能）
router.post('/', authenticateToken, requireAdmin, validateToolCreate, createTool);

// 更新工具（管理员功能）
router.put('/:id', authenticateToken, requireAdmin, validateToolUpdate, updateTool);

// 删除工具（管理员功能）
router.delete('/:id', authenticateToken, requireAdmin, deleteTool);

// 获取所有工具（管理员功能）
router.get('/admin/all', authenticateToken, requireAdmin, getAllTools);

module.exports = router;
