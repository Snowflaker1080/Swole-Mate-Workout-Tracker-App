module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/sign-in"); // or res.status(401).send("Not authorised"); ##ADD??
  }
  next();
};