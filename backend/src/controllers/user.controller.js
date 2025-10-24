import User from '../models/user.model.js'

// Clerk auth callback
export const authCallback = async (req, res) => {
  try {
    const { clerkId } = req.body

    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID is required'
      })
    }

    // Find or create user
    let user = await User.findOne({ clerkId })

    if (!user) {
      user = await User.create({
        clerkId,
        usage: [
          { type: 'email', allowedLimit: 100, usedLimit: 0 },
          { type: 'sms', allowedLimit: 50, usedLimit: 0 },
          { type: 'push_notification', allowedLimit: 100, usedLimit: 0 }
        ]
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User authenticated',
      data: user
    })
  } catch (error) {
    console.error('Auth callback error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)
      .populate('apiKeys')
      .populate('templates')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    })
  }
}
