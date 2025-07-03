// User model import using ESM syntax
import User from "../models/user.js";

// Define and export the middleware function
export default async function passUserToView(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user;
        return next();
      }
    }

    // If no user is found or session doesn't exist, nullify user context
    req.user = null;
    res.locals.user = null;
    return next();
  } catch (err) {
    console.error('pass-user-to-view error:', err);
    req.user = null;
    res.locals.user = null;
    next();
  }
};