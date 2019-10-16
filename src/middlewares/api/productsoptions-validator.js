import status from 'http-status-codes';

// Add custom response methods
export default (req, res, next) => {
  const {
    year,
    make,
    model,
    part,
    sku,
  } = req.body;

  if (!year || !make || !model || !part || !sku) {
    return res.withError('Required paramters are missing.', status.BAD_REQUEST);
  }

  return next();
};
