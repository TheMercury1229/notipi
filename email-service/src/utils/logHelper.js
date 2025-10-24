import Log from "../models/log.model.js";

/**
 * Get logs for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getUserLogs(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    status,
    eventType = "email",
    startDate,
    endDate,
  } = options;

  const query = {
    user: userId,
    eventType,
  };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await Log.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("apiKey", "name")
    .lean();

  return logs;
}

/**
 * Get log statistics for a user
 * @param {string} userId - User ID
 * @param {string} eventType - Event type
 * @returns {Promise<Object>}
 */
export async function getLogStats(userId, eventType = "email") {
  const stats = await Log.aggregate([
    {
      $match: {
        user: userId,
        eventType,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    success: 0,
    failure: 0,
    total: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
}

export default {
  getUserLogs,
  getLogStats,
};
