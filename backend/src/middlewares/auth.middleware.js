export const isProtected = async (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    res.status(401).json({ error: "Unauthorized - Please login to continue" });
  }

  next();
};
