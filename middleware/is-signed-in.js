// Export middleware function using ESM syntax
export default function isSignedIn(req, res, next) {
  // Check if the session exists and a user is logged in
  if (!req.session?.userId) {
    return res.redirect("/auth/sign-in");
  }
  // If the user is signed in, allow the request to proceed
  next();
}