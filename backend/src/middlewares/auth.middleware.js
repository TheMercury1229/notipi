import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      })
    }

    const token = authHeader.split(' ')[1]

    // Decode Clerk JWT
    const decoded = jwt.decode(token)

    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: decoded.sub })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}
