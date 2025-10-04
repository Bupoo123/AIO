const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  changePassword,
  createUser,
  getUsers,
  resetUserPassword,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateLogin,
  validateUserCreate
} = require('../middleware/validation');

// 用户登录
router.post('/login', validateLogin, login);

// 获取当前用户信息
router.get('/me', authenticateToken, getMe);

// 修改密码
router.put('/password', authenticateToken, changePassword);

// 创建用户（管理员功能）
router.post('/users', authenticateToken, requireAdmin, validateUserCreate, createUser);

// 获取用户列表（管理员功能）
router.get('/users', authenticateToken, requireAdmin, getUsers);

// 重置用户密码（管理员功能）
router.put('/users/:userId/password', authenticateToken, requireAdmin, resetUserPassword);

// 更新用户信息（管理员功能）
router.put('/users/:userId', authenticateToken, requireAdmin, updateUser);

// 删除用户（管理员功能）
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
