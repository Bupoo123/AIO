const Tool = require('../models/Tool');

// 获取工具列表
const getTools = async (req, res) => {
  try {
    const tools = await Tool.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        tools
      }
    });
  } catch (error) {
    console.error('获取工具列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 创建工具（管理员功能）
const createTool = async (req, res) => {
  try {
    const { title, description, url, icon } = req.body;
    const createdBy = req.user._id;

    const tool = new Tool({
      title,
      description,
      url,
      icon: icon || '🔧',
      createdBy
    });

    await tool.save();
    await tool.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: '工具创建成功',
      data: {
        tool
      }
    });
  } catch (error) {
    console.error('创建工具错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取工具详情
const getToolById = async (req, res) => {
  try {
    const { id } = req.params;

    const tool = await Tool.findById(id)
      .populate('createdBy', 'username');

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: '工具不存在'
      });
    }

    res.json({
      success: true,
      data: {
        tool
      }
    });
  } catch (error) {
    console.error('获取工具详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新工具（管理员功能）
const updateTool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: '工具不存在'
      });
    }

    // 更新工具
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    res.json({
      success: true,
      message: '工具更新成功',
      data: {
        tool: updatedTool
      }
    });
  } catch (error) {
    console.error('更新工具错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 删除工具（管理员功能）
const deleteTool = async (req, res) => {
  try {
    const { id } = req.params;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: '工具不存在'
      });
    }

    // 软删除：设置为不活跃
    tool.isActive = false;
    await tool.save();

    res.json({
      success: true,
      message: '工具删除成功'
    });
  } catch (error) {
    console.error('删除工具错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取所有工具（管理员功能）
const getAllTools = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const tools = await Tool.find({})
      .populate('createdBy', 'username')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tool.countDocuments({});

    res.json({
      success: true,
      data: {
        tools,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取所有工具错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getTools,
  createTool,
  getToolById,
  updateTool,
  deleteTool,
  getAllTools
};
