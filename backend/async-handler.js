// Wraps an async route handler so a rejected promise is forwarded to Express'
// error-handling middleware instead of leaving the request hanging.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)