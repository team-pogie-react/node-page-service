import {
  _,
  isObject,
  isEmpty,
  merge,
} from 'lodash';
import { VEHICLE_PARAMS, FILTER_PARAMS } from '../configs/services/search-params';

/**
 * Determine if newrelic is enabled.
 *
 * @returns {Boolean}
 */
export function isNewrelicEnabled() {
  const env = process.env.NEW_RELIC_ENABLED;
  const enabled = env !== 'undefined' ? parseInt(env, 10) : 1;

  return enabled === 1;
}

/**
 * Generic encoding without modifying letter case.
 *
 * @param {String} text
 *
 * @returns {String}
 */
export function encode(text = '') {
  let src = text.trim();

  src = src.replace(/&/g, '-and-');
  src = src.replace(/,/g, '-comma-');
  src = src.replace(/\./g, '-dot-');
  src = src.replace(/"/g, '-qt-');
  src = src.replace(/\(/g, '-openp-');
  src = src.replace(/\)/g, '-closep-');
  src = src.replace(/\+/g, '-plus-');
  src = src.replace(/;/g, '-semi-');
  src = src.replace(/\//g, '-fs-');

  // this should come last as other substitutions might have unnecessary space.
  src = src.replace(/\s/g, '_');

  return src;
}

/**
 * Decode text from encoded value.
 *
 * @param {String} text
 *
 * @returns {String}
 */
export function decode(text = '') {
  let src = text.trim();
  src = src.replace(/(\/l-r\/)/g, '/l-and-r/');
  src = src.replace(/(\/l-r$)/g, '/l-and-r');
  src = src.replace(/(\/t-h\/)/g, '/t-and-h/');
  src = src.replace(/(\/t-h$)/g, '/t-and-h');
  src = src.replace(/(\/b-g\/)/g, '/b-and-g/');
  src = src.replace(/(\/b-g$)/g, '/b-and-g');
  src = src.replace(/(\/b-m\/)/g, '/b-and-m/');
  src = src.replace(/(\/b-m$)/g, '/b-and-m');
  src = src.replace(/(\/k-n\/)/g, '/k-and-n/');
  src = src.replace(/(\/k-n$)/g, '/k-and-n');
  src = src.replace(/(\/j-l\/)/g, '/j-and-l/');
  src = src.replace(/(\/j-l$)/g, '/j-and-l');
  src = src.replace(/-fs-/g, '-');
  src = src.replace(/-dot-/g, '');
  src = src.replace(/-qt-/g, '');
  src = src.replace(/--and--/g, '-and-');
  src = src.replace(/-comma-/g, '');
  src = src.replace(/-openp-/g, '');
  src = src.replace(/-closep-/g, '');
  src = src.replace(/\.html/g, '');
  src = src.replace(/\/details/g, '');
  src = src.replace(/_/g, '-');
  src = src.replace(/ /g, '-');
  src = src.replace(/\'/g, '');
  src = src.replace(/,/g, '');
  src = src.replace(/\(/g, '');
  src = src.replace(/\)/g, '');
  src = src.replace(/(\/a---b\/)/g, '/a-and-b/');
  src = src.replace(/(\/a---b$)/g, '/a-and-b');
  src = src.replace(/(\/apauro-parts\/)/g, '/apa-uro-parts/');
  src = src.replace(/(\/apauro-parts$)/g, '/apa-uro-parts');
  src = src.replace(/(\/candm-hydraulics\/)/g, '/c-and-m-hydraulics/');
  src = src.replace(/(\/candm-hydraulics$)/g, '/c-and-m-hydraulics');
  src = src.replace(/(\/pop---lock\/)/g, '/pop-and-lock/');
  src = src.replace(/(\/pop---lock$)/g, '/pop-and-lock');
  src = src.replace(/(\/vaip---vision-lighting\/)/g, '/vaip-vision-lighting/');
  src = src.replace(/(\/vaip---vision-lighting$)/g, '/vaip-vision-lighting');
  src = src.replace(/(\/perf-accessories\/)/g, '/performance-accessories/');
  src = src.replace(/(\/perf-accessories$)/g, '/performance-accessories');
  src = src.replace(/(\/a.e.-auto-parts\/)/g, '/ae-auto-parts/');
  src = src.replace(/(\/a.e.-auto-parts$)/g, '/ae-auto-parts');
  src = src.replace(/(\/nrf-b.v.\/)/g, '/nrf-bv/');
  src = src.replace(/(\/nrf-b.v.$)/g, '/nrf-bv');
  src = src.replace(/(\/classic---performance\/)/g, '/classic-and-performance/');
  src = src.replace(/(\/classic---performance$)/g, '/classic-and-performance');
  src = src.replace(/(\/c-m-hydraulics\/)/g, '/c-and-m-hydraulics/');
  src = src.replace(/(\/c-m-hydraulics$)/g, '/c-and-m-hydraulics');
  src = src.replace(/(\/fischer---plath\/)/g, '/fischer-and-plath/');
  src = src.replace(/(\/fischer---plath$)/g, '/fischer-and-plath');
  src = src.replace(/(\/hjs---leistritz\/)/g, '/hjs-leistritz/');
  src = src.replace(/(\/hjs---leistritz$)/g, '/hjs-leistritz');
  src = src.replace(/(\/fuel-injection-corp.\/)/g, '/fuel-injection-corp/');
  src = src.replace(/(\/fuel-injection-corp.$)/g, '/fuel-injection-corp');
  src = src.replace(/(\/atlantic-automotive-ent.\/)/g, '/atlantic-automotive-ent/');
  src = src.replace(/(\/atlantic-automotive-ent.$)/g, '/atlantic-automotive-ent');
  src = src.replace(/(\/osaka-bane-inc.\/)/g, '/osaka-bane-inc/');
  src = src.replace(/(\/osaka-bane-inc.$)/g, '/osaka-bane-inc');
  src = src.replace(/(\/a.i.m.\/)/g, '/aim/');
  src = src.replace(/(\/a.i.m.$)/g, '/aim');
  src = src.replace(/(\/weld-street---strip\/)/g, '/weld-street-and-strip/');
  src = src.replace(/(\/weld-street---strip$)/g, '/weld-street-and-strip');
  src = src.replace(/(\/laengerer---reich\/)/g, '/laengerer-and-reich/');
  src = src.replace(/(\/laengerer---reich$)/g, '/laengerer-and-reich');
  src = src.replace(/(\/yukon-gear---axle\/)/g, '/yukon-gear-and-axle/');
  src = src.replace(/(\/yukon-gear---axle$)/g, '/yukon-gear-and-axle');
  src = src.replace(/(\/miller---norburn\/)/g, '/miller-and-norburn/');
  src = src.replace(/(\/miller---norburn$)/g, '/miller-and-norburn');
  src = src.replace(/(\/f450\/)/g, '/f-450/');
  src = src.replace(/(\/f450$)/g, '/f-450');
  src = src.replace(/(\/f350\/)/g, '/f-350/');
  src = src.replace(/(\/f350$)/g, '/f-350');
  src = src.replace(/(\/ford\/e250\/)/g, '/ford/e-250/');
  src = src.replace(/(\/ford\/e250$)/g, '/ford/e-250');
  src = src.replace(/(\/ford\/e350\/)/g, '/ford/e-350/');
  src = src.replace(/(\/ford\/e350$)/g, '/ford/e-350');
  src = src.replace(/(\/ford\/e450\/)/g, '/ford/e-450/');
  src = src.replace(/(\/ford\/e450$)/g, '/ford/e-450');
  src = src.replace(/(\/jaguar\/3.8\/)/g, '/jaguar/38/');
  src = src.replace(/(\/jaguar\/3.8$)/g, '/jaguar/38');
  src = src.replace(/(\/jaguar\/3.4\/)/g, '/jaguar/34/');
  src = src.replace(/(\/jaguar\/3.4$)/g, '/jaguar/34');
  src = src.replace(/(\/jaguar\/3.2\/)/g, '/jaguar/32/');
  src = src.replace(/(\/jaguar\/3.2$)/g, '/jaguar/32');
  src = src.replace(/(\/dodge\/sx-2.0\/)/g, '/dodge/sx-20/');
  src = src.replace(/(\/dodge\/sx-2.0$)/g, '/dodge/sx-20');
  src = src.replace(/(\/dodge\/st.-regis\/)/g, '/dodge/st-regis/');
  src = src.replace(/(\/dodge\/st.-regis$)/g, '/dodge/st-regis');
  src = src.replace(/(\/ferrari\/mondial-3.2\/)/g, '/ferrari/mondial-32/');
  src = src.replace(/(\/ferrari\/mondial-3.2$)/g, '/ferrari/mondial-32');
  src = src.replace(/(\/mx5-miata\/)/g, '/mx-5-miata/');
  src = src.replace(/(\/mx5-miata$)/g, '/mx-5-miata');
  src = src.replace(/(\/cl55amg\/)/g, '/cl55-amg/');
  src = src.replace(/(\/cl55amg$)/g, '/cl55-amg');
  src = src.replace(/(\/f150\/)/g, '/f-150/');
  src = src.replace(/(\/f150$)/g, '/f-150');
  src = src.replace(/(\/rx2\/)/g, '/rx-2/');
  src = src.replace(/(\/rx2$)/g, '/rx-2');
  src = src.replace(/(\/rx3\/)/g, '/rx-3/');
  src = src.replace(/(\/rx3$)/g, '/rx-3');
  src = src.replace(/(\/rx4\/)/g, '/rx-4/');
  src = src.replace(/(\/rx4$)/g, '/rx-4');
  src = src.replace(/(\/rx7\/)/g, '/rx-7/');
  src = src.replace(/(\/rx7$)/g, '/rx-7');
  src = src.replace(/(\/rx8\/)/g, '/rx-8/');
  src = src.replace(/(\/rx8$)/g, '/rx-8');
  src = src.replace(/(\/mx6\/)/g, '/mx-6/');
  src = src.replace(/(\/mx6$)/g, '/mx-6');
  src = src.replace(/(\/mx3\/)/g, '/mx-3/');
  src = src.replace(/(\/mx3$)/g, '/mx-3');
  src = src.replace(/(\/e55amg\/)/g, '/e55-amg/');
  src = src.replace(/(\/e55amg$)/g, '/e55-amg');
  src = src.replace(/(\/crv\/)/g, '/cr-v/');
  src = src.replace(/(\/crv$)/g, '/cr-v');
  src = src.replace(/(\/crz\/)/g, '/cr-z/');
  src = src.replace(/(\/crz$)/g, '/cr-z');

  // this should come last as other substitutions might have unnecessary space.
  src = src.replace(/_/g, ' ');

  return src;
}

/**
 * Determine if value is falsy.
 *
 * @param {Mixed} value
 *
 * @returns {Boolean}
 */
export function isFalsy(value) {
  return !value || (isObject(value) && isEmpty(value));
}

/**
 * Encode text and convert to lower case.
 *
 * @param {String} text
 *
 * @returns {String}
 */
export function encodeToLower(text) {
  return encode(text).toLowerCase();
}

/**
 * Encoding scheme for seo related strings.
 *
 * @param {String} content
 *
 * @returns {String}
 */
export function seoEncode(content = '') {
  let str = content.trim().toLowerCase();

  str = str.replace(/l-r/g, 'l-and-r');
  str = str.replace(/t-h/g, 't-and-h');
  str = str.replace(/b-g/g, 'b-and-g');
  str = str.replace(/b-m/g, 'b-and-m');
  str = str.replace(/k-n/g, 'k-and-n');
  str = str.replace(/j-l/g, 'j-and-l');
  str = str.replace(/-fs-/g, '-');
  str = str.replace(/-dot-/g, '');
  str = str.replace(/-qt-/g, '');
  str = str.replace(/-comma-/g, '');
  str = str.replace(/-openp-/g, '');
  str = str.replace(/-closep-/g, '');
  str = str.replace(/\.html/g, '');
  str = str.replace(/\/details/g, '');
  str = str.replace(/ & /g, '-and-');
  str = str.replace(/&/g, '-and-');
  str = str.replace(/_/g, ' ');
  str = str.replace(/ /g, '-');
  str = str.replace(/\./g, '');
  str = str.replace(/\\'/g, '');
  str = str.replace(/,/g, '');
  str = str.replace(/\(/g, '');
  str = str.replace(/\)/g, '');
  str = str.replace(/---/g, '-');
  str = str.replace(/--/g, '-');
  str = str.replace(/\\"/g, '');
  str = str.replace(/\//g, '-');
  str = str.replace(/a---b/g, 'a-and-b');
  str = str.replace(/apuro/g, 'apa-uro');
  str = str.replace(/candm/g, 'c-and-m');
  str = str.replace(/pop---lock/g, 'pop-and-lock');
  str = str.replace(/vaip---vision/g, 'vaip-vision');

  return str;
}

/**
 * Helper function to get base image url based on domain.
 *
 * @param {String} domain
 */
export function getImageBaseUrl(domain) {
  switch (true) {
    case /cp/.test(domain):
    case /carparts/.test(domain):
      return process.env.CP_BASE_IMAGE_URL;

    default:
      return process.env.CP_BASE_IMAGE_URL;
  }
}

/**
 * Product uri generation helper.
 *
 * @param {Object} product
 *
 * @returns {String}
 */
export function generateProductUri(product) {
  const seoSku = ('brand_sku' in product && product.brand_sku !== '')
    ? `/${seoEncode(product.sku)}` : '';
  const seoBrand = ('brand' in product && product.brand !== '')
    ? `/${seoEncode(product.brand)}` : '';
  const seoPart = ('part' in product && product.part !== '')
    ? `/${seoEncode(product.part)}` : '';

  return `${seoPart}${seoBrand}${seoSku}`;
}


/**
 * Convert request uri into a seo getcontents uri format with ~ delimiter.
 *
 * @param {String} url
 *
 * @returns {String}
 */
export function generateContentsUri(url) {
  if (url === '') {
    return url;
  }

  let newUrl = '';
  const urlArray = url.split('/');

  if (urlArray[0] === '') {
    urlArray.shift();
  }

  newUrl = urlArray.join('~');

  return newUrl;
}


/**
 * Sort JSON object alphabetically by key
 *
 * @param {Object} obj
 * @param {Boolean} recursive
 *
 * @returns {Object}
 */

export function sortByKey(obj, recursive = false) {
  const ordered = {};

  _(obj).keys().sort().each((key) => {
    if (recursive && obj[key] instanceof Object && obj[key].constructor !== Array) {
      ordered[key] = sortByKey(obj[key], recursive);
    } else {
      ordered[key] = obj[key];
    }
  });

  return ordered;
}

/**
 * Generate URI for link nodes
 *
 * @param {Object} pageAttr
 *
 * @returns {String}
 */

export function getLinkByPageAttr(pageAttr) {
  const uriSegments = [];

  if (pageAttr.brand) {
    if (_.isObject(pageAttr.brand) && pageAttr.brand.brand_name) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.brand.brand_name)));
    } else if (_.isString(pageAttr.brand)) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.brand)));
    }
  }

  if (pageAttr.part) {
    if (_.isObject(pageAttr.part) && pageAttr.part.part_name) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.part.part_name)));
    } else if (_.isString(pageAttr.part)) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.part)));
    }
  }

  if (pageAttr.make) {
    if (_.isObject(pageAttr.make) && pageAttr.make.make_name) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.make.make_name)));
    } else if (_.isString(pageAttr.make)) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.make)));
    }
  }

  if (pageAttr.model) {
    if (_.isObject(pageAttr.model) && pageAttr.model.model_name) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.model.model_name)));
    } else if (_.isString(pageAttr.model)) {
      uriSegments.push(seoEncode(decodeURIComponent(pageAttr.model)));
    }
  }

  if (pageAttr.year) {
    if (_.isObject(pageAttr.year) && pageAttr.year.year) {
      uriSegments.push(seoEncode(pageAttr.year.year));
    } else if (_.isString(pageAttr.year)) {
      uriSegments.push(seoEncode(pageAttr.year));
    }
  }

  return `/${uriSegments.join('/')}`;
}

/**
 * Generate value for text nodes
 *
 * @param {Object} pageAttr
 *
 * @returns {String}
 */

export function getTextByPageAttr(pageAttr) {
  let text = '';

  if (pageAttr.brand) {
    if (_.isObject(pageAttr.brand) && pageAttr.brand.brand_name) {
      text += `${pageAttr.brand.brand_name} `;
    } else if (_.isString(pageAttr.brand)) {
      text += `${pageAttr.brand} `;
    }
  }

  if (pageAttr.make) {
    if (_.isObject(pageAttr.make) && pageAttr.make.make_name) {
      text += `${pageAttr.make.make_name} `;
    } else if (_.isString(pageAttr.make)) {
      text += `${pageAttr.make} `;
    }
  }

  if (pageAttr.model) {
    if (_.isObject(pageAttr.model) && pageAttr.model.model_name) {
      text += `${pageAttr.model.model_name} `;
    } else if (_.isString(pageAttr.model)) {
      text += `${pageAttr.model} `;
    }
  }

  if (pageAttr.year) {
    if (_.isObject(pageAttr.year) && pageAttr.year.year) {
      text += `${pageAttr.year.year} `;
    } else if (_.isString(pageAttr.year)) {
      text += `${pageAttr.year} `;
    }
  }

  if (pageAttr.part) {
    if (_.isObject(pageAttr.part) && pageAttr.part.part_name) {
      text += `${pageAttr.part.part_name} `;
    } else if (_.isString(pageAttr.part)) {
      text += `${pageAttr.part} `;
    }
  }

  return decodeURIComponent(text.trim());
}

/**
 * Convert the given attribute and additional uri params into UNBXD format
 *
 * @param {Object} attributes  - contains attribute of the page, this could possibly include
 *                             - make, model, part, brand and year
 * @param {Object} queryObject - Contains additional parameter to be appended to the newly
 *                             - generated url
 */
export function convertToUNBXDFormat(attributes, queryObject) {
  const vehicleParams = VEHICLE_PARAMS;
  const obj = merge({}, queryObject);
  const filteParams = FILTER_PARAMS;

  _.each(vehicleParams, (value, key) => {
    const item = _.get(attributes, `${key}.${value}`, '');

    if (item === '') {
      return;
    }

    _.set(obj, `vehicle.${key}`, encode(item));
  });


  _.each(filteParams, (value, key) => {
    const item = _.get(attributes, `${key}.${value}`, '');

    if (item === '') {
      return;
    }

    _.set(obj, `filters.${key}`, encode(item));
  });

  // Delete unnecessary params
  delete obj.uri;

  return obj;
}

/**
 * Encode given string into VLP format
 * @param {String} str
 */
export function encodeToVLP(str) {
  let paramStr = str;
  if (paramStr === '') {
    return '';
  }

  paramStr = paramStr.replace(/ /g, '_');
  paramStr = paramStr.replace(/&/g, '-and-');
  paramStr = paramStr.replace(/\./g, '-dot-');
  paramStr = paramStr.replace(/\\/g, '-qt-');
  paramStr = paramStr.replace(/, /g, '-comma-');
  paramStr = paramStr.replace(/,/g, '-comma-');
  paramStr = paramStr.replace(/\(/g, '-openp-');
  paramStr = paramStr.replace(/\)/g, '-closep-');
  paramStr = paramStr.replace(/\+/g, '-plus-');
  paramStr = paramStr.replace(/;/g, '-semmi-');
  paramStr = paramStr.replace(/\//g, '-fs-');

  return paramStr;
}


/**
 * Validate given string if valid uri and no special chars
 * @param {String} str
 */
export function isAlphaNumeric(str) {
  let i = 0;
  let len = 0;
  for (i = 0, len = str.length; i < len; i += 1) {
    const code = str.charCodeAt(i);
    const schar = [45, 95, 47, 32]; // '-','_','/'
    // console.log('code',code);
    if (!(code >= 48 && code <= 57) // numeric (0-9)
        && !(code >= 65 && code <= 90) // upper alpha (A-Z)
        && !(code >= 97 && code <= 122) // lower alpha (a-z)
        && !(schar.includes(code))) { // valid special chars
      return false;
    }
  }

  return true;
}

/**
 * Clean Console log
 * @param {String} str
 */
export function consoler(label, value) {
  // eslint-disable-next-line no-console
  console.log(`\n###CONSOLE LOGGER >> ${label}: `, value);
  // eslint-disable-next-line no-console
  console.log('\n');

  return true;
}

export function engineDecode(str) {
  const engineData = str.split('Cyl');
  let i = 0;
  let len = 0;
  const engine = [];
  for (i = 0, len = engineData.length; i < len; i += 1) {
    engine[i] = decode(engineData[i]).replace('L', '').trim();
  }

  return engine;
}

