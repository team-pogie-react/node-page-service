import { _ } from 'lodash';

export default class BaseModel {
  get(property) {
    return this[property];
  }

  set(property, val) {
    this[property] = val;
  }

  isInt(val) {
    let r = null;
    if (_.isInteger(val)) {
      r = val;
    } else {
      throw new TypeError(`${val} Not Integer`);
    }

    return r;
  }

  isStr(val) {
    let r = null;
    if (!_.isEmpty(val) && _.isString(val)) {
      r = val;
    } else {
      throw new TypeError(`${val} Not String`);
    }

    return r;
  }

  isArray(val) {
    let r = null;
    if (!_.isEmpty(val) && _.isArray(val)) {
      r = val;
    } else {
      throw new TypeError(`${val} Not Array`);
    }

    return r;
  }
}
