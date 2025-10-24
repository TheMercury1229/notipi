/**
 * Error response handler
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} data - Additional data
 */
export function errorResponse(res, statusCode, message, data = null) {
  const response = {
    success: false,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Success response handler
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
export function successResponse(res, statusCode, message, data = null) {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Async handler wrapper to catch errors
 * @param {Function} fn - Async function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  errorResponse,
  successResponse,
  asyncHandler,
};
