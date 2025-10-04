const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '工具名称是必填项'],
    trim: true,
    maxlength: [100, '工具名称最多100个字符']
  },
  description: {
    type: String,
    required: [true, '工具描述是必填项'],
    trim: true,
    maxlength: [500, '工具描述最多500个字符']
  },
  url: {
    type: String,
    required: [true, '工具链接是必填项'],
    trim: true
  },
  icon: {
    type: String,
    default: '🔧',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新修改时间
toolSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引
toolSchema.index({ title: 1 });
toolSchema.index({ isActive: 1 });

module.exports = mongoose.model('Tool', toolSchema);
