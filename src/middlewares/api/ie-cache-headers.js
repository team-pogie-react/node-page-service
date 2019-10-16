export default (req, res, next) => {
  res.append('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.append('Pragma', 'no-cache');
  res.append('Expires', '0');
  next();
};
