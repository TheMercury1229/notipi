import Log from "../models/log.model.js";
import User from "../models/user.model.js";
import ApiKey from "../models/apikey.model.js";

// Get analytics stats for the authenticated user
export const getAnalyticsStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's API keys
    const userApiKeys = await ApiKey.find({ user: userId });
    const apiKeyIds = userApiKeys.map((key) => key._id);

    // Get total logs count by type
    const logsByType = await Log.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get logs by status
    const logsByStatus = await Log.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get weekly activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivity = await Log.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$eventType",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    // Get hourly activity (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const hourlyActivity = await Log.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get API key usage
    const apiKeyUsage = await Log.aggregate([
      {
        $match: {
          user: userId,
          apiKey: { $in: apiKeyIds },
        },
      },
      {
        $group: {
          _id: "$apiKey",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "apikeys",
          localField: "_id",
          foreignField: "_id",
          as: "keyInfo",
        },
      },
      {
        $unwind: "$keyInfo",
      },
      {
        $project: {
          name: "$keyInfo.name",
          count: 1,
        },
      },
    ]);

    // Get user usage stats
    const user = await User.findById(userId);

    // Calculate totals
    const totalLogs = await Log.countDocuments({ user: userId });
    const successfulLogs = await Log.countDocuments({
      user: userId,
      status: "success",
    });
    const failedLogs = await Log.countDocuments({
      user: userId,
      status: "failure",
    });

    // Format the response
    const stats = {
      overview: {
        total: totalLogs,
        successful: successfulLogs,
        failed: failedLogs,
        successRate:
          totalLogs > 0
            ? ((successfulLogs / totalLogs) * 100).toFixed(2)
            : 0,
      },
      byType: logsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: logsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      weeklyActivity,
      hourlyActivity,
      apiKeyUsage,
      usage: user.usage,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get analytics stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get analytics stats",
    });
  }
};

// Get activity logs for the authenticated user
export const getActivityLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type,
      status,
      limit = 50,
      skip = 0,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = { user: userId };

    if (type) {
      query.eventType = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get logs
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("apiKey", "name")
      .lean();

    // Get total count
    const total = await Log.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get activity logs",
    });
  }
};

// Get real-time stats (for dashboard widgets)
export const getRealTimeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get stats for the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const [recentLogs, todayLogs, user] = await Promise.all([
      Log.countDocuments({
        user: userId,
        createdAt: { $gte: oneHourAgo },
      }),
      Log.countDocuments({
        user: userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      User.findById(userId),
    ]);

    // Get active API keys count
    const activeApiKeys = await ApiKey.countDocuments({
      user: userId,
      isRevoked: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        lastHour: recentLogs,
        today: todayLogs,
        activeApiKeys,
        usage: user.usage,
      },
    });
  } catch (error) {
    console.error("Get real-time stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get real-time stats",
    });
  }
};