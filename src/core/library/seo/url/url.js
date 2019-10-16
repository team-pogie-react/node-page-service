import _ from 'lodash';
import map from './config/map';
import Logger from '../../../Logger';


class Url {
  /**
   * Create Url Formatter instance.
   */
  constructor() {
    this.map = map;
    this.prefix = 'UrlFormatter';
  }

  /**
   * encode()
   *
   * @param {String} string
   * @param {String} pageType
   *
   * @return array
   */
  encode(string, pageType) {
    const self = this;

    if (typeof string === 'object') {
      return self.encodeMany(string, pageType);
    }

    const collection = self.getCollection(pageType) || {};
    let result = string;
    _.each(collection, (value) => {
      try {
        const pattern = _.get(value, 'pattern', '');
        const text = _.get(value, 'text', '');
        const expression = new RegExp(pattern, 'g');
        if (expression.test(result)) {
          result = _.replace(_.toLower(result), expression, text);
        }
      } catch (err) {
        Logger.error(err);

        return false;
      }

      return true;
    });

    return _.toLower(result);
  }

  /**
   * encodeMany()
   *
   * @param {Object} collection
   * @param {String} pageType
   *
   * @return string
   */
  encodeMany(collection, pageType) {
    const self = this;
    const result = [];


    if (!_.isObject(collection)) {
      return '';
    }

    _.each(collection, (item) => {
      result.push(self.encode(item, pageType));
    });

    const res = _.join(result, '/') || '';

    return `/${res}`;
  }


  /**
   * encode()
   *
   * @return array
   */
  getCollection(pageType) {
    switch (_.lowerCase(pageType)) {
      case 'brand':
      case 'part':
      case 'model':
      default:
        return this.map || [];
    }
  }
}


export default Url;
