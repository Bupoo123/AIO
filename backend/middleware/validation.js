const { body, validationResult } = require('express-validator');

// 处理验证错误
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// 用户登录验证
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空'),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  
  handleValidationErrors
];

// 用户创建验证
const validateUserCreate = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('角色必须是user或admin'),
  
  body('tempPassword')
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage('临时密码至少6个字符'),
  
  handleValidationErrors
];

// 工具创建验证
const validateToolCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('工具名称不能为空')
    .isLength({ max: 100 })
    .withMessage('工具名称最多100个字符'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('工具描述不能为空')
    .isLength({ max: 500 })
    .withMessage('工具描述最多500个字符'),
  
  body('url')
    .trim()
    .notEmpty()
    .withMessage('工具链接不能为空')
    .isURL()
    .withMessage('请输入有效的URL'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('图标最多10个字符'),
  
  handleValidationErrors
];

// 工具更新验证
const validateToolUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('工具名称长度必须在1-100个字符之间'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('工具描述最多500个字符'),
  
  body('url')
    .optional()
    .trim()
    .isURL()
    .withMessage('请输入有效的URL'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('图标最多10个字符'),
  
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateUserCreate,
  validateToolCreate,
  validateToolUpdate,
  handleValidationErrors
};
