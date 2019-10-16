/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import queryString from 'qs';
import _ from 'lodash';
import { expect } from 'chai';
import VehicleService from '../../../src/services/Vehicle';
import { DOMAINS } from '../../../src/configs/services/domains';
import operationKeys from '../../../src/configs/services/operation-keys';
import ApiService from '../../../src/services/ApiService';

describe('Vehicle Service Test', () => {
  const service = new VehicleService();
  const apiService = new ApiService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for years() operation', () => {
      expect(service.getDomain(operationKeys.GET_YEARS)).to.be.equal(DOMAINS.CARPARTS);
    });
  });

  it('gets years from catalog', (done) => {
    service.years().then((result) => {
      expect(_.size(result)).to.be.greaterThan(1);
      expect(result).to.include(new Date().getFullYear());

      done();
    }).catch(done);
  });

  it('displays Vehicle ID and Info', (done) => {
    const query = {
      domain: DOMAINS.CARPARTS,
      year: 2016,
      model: 'A4',
      make: 'Audi',
      engine: '4 Cyl 2.0L',
      submodel: 'Premium',
    };
    const operation = operationKeys.GET_VEHICLE_ID;
    apiService.setDomain('carparts.com');
    const data = queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: apiService.getDomain(operation),
        year: query.year,
        model: query.model,
        make: query.make,
        engine: encodeURI(query.engine),
        submodel: query.submodel,
      }),
      format: 'json',
    }, { encode: true });

    service.getVehicleIdByYMM(data).then((result) => {
      expect(_.size(result)).to.be.greaterThan(0);

      // Check if Vehicle Info based on the generated Vehicle ID
      const operationVehicleInfo = operationKeys.GET_VEHICLE_INFO;
      apiService.setDomain('carparts.com');
      const dataVehicleInfo = queryString.stringify({
        op: operationVehicleInfo,
        data: JSON.stringify({
          catalogSource: 'productlookupdb',
          site: apiService.getDomain(operationVehicleInfo),
          vehicleId: result.vehicle_id,
        }),
        format: 'json',
      }, { encode: true });

      service.getVehicleInfoById(dataVehicleInfo).then((resultVehicleInfo) => {
        expect(_.size(resultVehicleInfo)).to.be.greaterThan(0);

        done();
      }).catch(done);
    }).catch(done);
  });
});
