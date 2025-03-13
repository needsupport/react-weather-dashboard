export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[<>&"\']/g, '');
  }
  return input;
};

export const preventXSS = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    req.body[key] = sanitizeInput(req.body[key]);
  });
  next();
};