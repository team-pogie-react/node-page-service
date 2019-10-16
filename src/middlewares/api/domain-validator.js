import { values } from 'lodash';
import status from 'http-status-codes';
import { isFalsy } from '../../core/helpers';
import { DOMAINS } from '../../configs/services/domains';

function isValid(domain) {
  const domains = values(DOMAINS);

  return domains.indexOf(domain) !== -1;
}

// Add custom response methods
export default (req, res, next) => {
  const { query, body } = req;

  if (isFalsy(body.domain) && isFalsy(query.domain)) {
    return res.withError('Domain parameter is missing.', status.BAD_REQUEST);
  }

  if (!isValid(body.domain) && !isValid(query.domain)) {
    return res.withError('Domain parameter is invalid.', status.BAD_REQUEST);
  }

  return next();
};
