import { DOMAINS } from './domains';

const cpId = process.env.CP_RESELLER_RATING_ID;
const cpVersion = process.env.CP_RESELLER_RATING_API_VERSION;
const resellerApi = process.env.RESELLER_RATING_API_URL;

export const { RESELLER_RATING_URL } = process.env;
export const reseller = {
  [DOMAINS.CARPARTS]: {
    GRANT_TYPE: process.env.CP_RESELLER_RATING_GRANT_TYPE,
    CLIENT_ID: process.env.CP_RESELLER_RATING_CLIENT_ID,
    CLIENT_SECRET: process.env.CP_RESELLER_RATING_CLIENT_SECRET,
    ACCESS_TOKEN_URL: `${resellerApi}/oauth/access_token`,
    REVIEW_URL: `${resellerApi}/${cpVersion}/seller/${cpId}/reviews`,
    RATING_URL: `${resellerApi}/${cpVersion}/seller/${cpId}`,
    STARS: 5,
    PER_PAGE: 3,
  },
};
