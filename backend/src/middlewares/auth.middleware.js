export const checkAuth = (req, res, next) => {
  try {
    if (!req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
