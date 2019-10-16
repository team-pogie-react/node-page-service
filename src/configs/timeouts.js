export const production = {
  RESELLER: 6000,
  BLOGS: 4500,
  CATALOG: 6000, // timeout during index 750ms
  CATALOG_2: 6000, // timeout during index 750ms
  MY_ACCOUNT: 13500,
  BRAINTREE: 13500,
  ORDER: 13500,
  ORDER_2: 6000,
  QUOTE_2: 10500,
  SEO: 23000,
  ORDER_PROXY: 903000, // 15 mins
  CONTENT: 600,
  CONTENT_2: 600,
  ACCOUNTS: 13500,
  SEO_NEXUS: 12000,
  SEARCH: 23000,
  PRODUCT_DETAILS: 23000,
  MYACCOUNT_PROXY: 903000, // 15 mins
  WIDGETS: 6000, // page_not_found takes a while
  RTPI: 6000,
  TURNTO: 5000,
};

export const dev = {
  RESELLER: 6000,
  BLOGS: 4500,
  CATALOG: 6000,
  CATALOG_2: 6000,
  MY_ACCOUNT: 13500,
  BRAINTREE: 13500,
  ORDER: 13500,
  ORDER_2: 6000,
  QUOTE_2: 10500,
  SEO: 23000,
  ORDER_PROXY: 301000,
  CONTENT: 600,
  CONTENT_2: 600,
  ACCOUNTS: 13500,
  SEO_NEXUS: 12000,
  SEARCH: 23000,
  PRODUCT_DETAILS: 23000,
  MYACCOUNT_PROXY: 301000,
  WIDGETS: 6000,
  RTPI: 12000,
  TURNTO: 5000,
};

function getEnvTimeouts() {
  if (process.env.NODE_ENV === 'production') {
    return production;
  }

  return dev;
}

export default getEnvTimeouts();
