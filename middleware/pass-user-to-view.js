const User = require('../models/user');

module.exports = async function passUserToView(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user;
        return next();
      }
    }

    // If no user or lookup failed
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