/* eslint-env mocha */
import _ from 'lodash';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import stubs from '../../stubs/accoutsetting.json';
import AccountsettingTransformer from
  '../../../src/transformers/MyAccount/AccountsettingTransformer';
import AccoutSettingModel from '../../../src/models/AccoutSettingModel';

chai.use(chaiSubset);

describe('AccountsettingTransformer', () => {
  const transformer = new AccountsettingTransformer();

  describe('customer()', () => {
    let result;
    beforeEach(() => {
      result = transformer.customer(stubs.accountSetting);
    });

    it('transformed account setting check properties', () => {
      _.each(AccoutSettingModel, (key) => {
        expect(result).to.have.property(key);
        expect(result[key]).to.not.be.equal(null);
        expect(result[key]).to.not.be.equal(undefined);
      });
    });

    it('transformed account setting check model instance', () => {
      expect(result).to.be.instanceOf(AccoutSettingModel);
    });

    it('transformed account setting does not have underscore properties', () => {
      expect(result).not.to.have.property('_firstName');
      expect(result).not.to.have.property('_lastName');
      expect(result).not.to.have.property('_emailAddress');
      expect(result).not.to.have.property('_emailPromotional');
    });

    it('transformed account setting validate values', () => {
      expect(result.firstName).to.be.equal(stubs.accountSetting
        .results.Accounts.Customer.customers_first_name);
      expect(result.lastName).to.be.equal(stubs.accountSetting
        .results.Accounts.Customer.customers_last_name);
      expect(result.emailAddress).to.be.equal(stubs.accountSetting
        .results.Accounts.Customer.customer_username);
      expect(result.emailPromotional).to.be.equal(stubs.accountSetting
        .results.Accounts.Customer.email_promotional ? 1 : 0);
    });
  });
});
