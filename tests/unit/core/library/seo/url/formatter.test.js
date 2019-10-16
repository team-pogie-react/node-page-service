/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import SeoUrlFormatter from '../../../../../../src/core/library/seo/url/formatter';

const Formatter = new SeoUrlFormatter();
const collection1 = [
  {
    part_name: '4WD Actuator',
  },
];
const brandsCollection = [
  {
    brand_name: 'Aries',
  },
];
const modelsCollection = [
  {
    model: 'Civic del Sol',
  },
];
const makesCollection = [
  {
    make: 'Acura',
  },
];


const topParts = ['A/C Condenser'];

describe('Seo Formatter:', () => {
  describe('generateUrl(String pageType = ``, Object Scope = {})', () => {
    it('Brand: Should be equal to the expected output: `/replacement`', () => {
      expect(Formatter.generateUrl('brand', { brand: 'replacement' })).to.be.equal('/replacement');
    });

    it('Part: Should be equal to the expected output: `/mirror`', () => {
      expect(Formatter.generateUrl('part', { part: 'mirror' })).to.be.equal('/mirror');
    });

    it('Make: Should be equal to the expected output: `/honda`', () => {
      expect(Formatter.generateUrl('make', { make: 'honda' })).to.be.equal('/honda');
    });

    it('Make Model: Should be equal to the expected output: `/honda/civic`', () => {
      expect(Formatter.generateUrl('make_model', { make: 'honda', model: 'civic' })).to.be.equal('/honda/civic');
    });

    it('Make Part: Should be equal to the expected output: `/honda/mirror`', () => {
      expect(Formatter.generateUrl('make_part', { make: 'honda', part: 'mirror' })).to.be.equal('/honda/mirror');
    });

    it('Brand Part: Should be equal to the expected output: `/replacement/mirror`', () => {
      expect(Formatter.generateUrl('brand_part', { brand: 'replacement', part: 'mirror' })).to.be.equal('/replacement/mirror');
    });

    it('Part Make Model: Should be equal to the expected output: `/mirror/honda/civic`', () => {
      expect(Formatter.generateUrl('part_make_model', { make: 'honda', model: 'civic', part: 'mirror' })).to.be.equal('/mirror/honda/civic');
    });

    it('Part Make Model Year: Should be equal to the expected output: `/mirror/honda/civic/2019`', () => {
      expect(Formatter.generateUrl('part_make_model_year', {
        make: 'honda', model: 'civic', part: 'mirror', year: 2019,
      })).to.be.equal('/mirror/honda/civic/2019');
    });

    it('[ Insufficient Scope ] Part: Should be equal to the expected output: ``', () => {
      expect(Formatter.generateUrl('part', { brand: 'replacement' })).to.be.equal('');
    });

    it('[ Insufficient Scope ] Brand Part: Should be equal to the expected output: ``', () => {
      expect(Formatter.generateUrl('brand_part', { brand: 'replacement' })).to.be.equal('');
    });

    it('[ Insufficient Scope ] Part Make Model Year: Should be equal to the expected output: ``', () => {
      expect(Formatter.generateUrl('part_make_model_year', { brand: 'replacement' })).to.be.equal('');
    });
  });


  describe('map(String map = ``, Object parts = {}, String domain = ``)', () => {
    const test0 = Formatter.map('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });

  describe('mapPartsToBrand(String brand = ``, Object parts = {}, String domain = ``)', () => {
    const test1 = Formatter.mapPartsToBrand('replacement', collection1, 'carparts.com');

    it('Should be equal to the expected output.', () => {
      expect(test1).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          text: 'Replacement 4WD Actuator',
          link: '/replacement/4wd-actuator',
        },
      ]);
    });
  });

  describe('mapBrandsToPart(String part = ``, Object brands = [], String domain = ``)', () => {
    const test2 = Formatter.mapBrandsToPart('bumper', brandsCollection, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test2).to.deep.equal([
        {
          link: '/aries/bumper',
          image: 'https://imgs.cpsimg.com/is/image/Autos/aries?defaultImage=noimage',
          text: 'Aries bumper',
        },
      ]);
    });
  });


  describe('mapRelBrandParts(String brand = ``, String mirror = ``, Array parts = [], String domain = ``)', () => {
    const mapRelBrandPartsTest = Formatter.mapRelBrandParts('replacement', 'mirror', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(mapRelBrandPartsTest).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/replacement?defaultImage=noimage',
          link: '/replacement/4wd-actuator',
          text: 'replacement 4WD Actuator mirror',
        },
      ]);
    });
  });


  describe('mapMakeModelPartToMakeModel(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test3 = Formatter.mapMakeModelPartToMakeModel('honda', 'civic', []);
    it('Should be equal to the expected output', () => {
      expect(test3).to.deep.equal([]);
    });
  });


  describe('mapPartsToMake(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test4 = Formatter.mapPartsToMake('toyota', topParts, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test4).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/a-fs-c_condenser?defaultImage=noimage',
          link: '/a-c-condenser/toyota',
          text: 'Toyota A/C Condenser',
        },

      ]);
    });
  });


  describe('mapModelsTssoMake(String map = ``, Array parts = {}, String domain = ``)', () => {
    const mapModelsToMakeTest = Formatter.mapModelsToMake('honda', modelsCollection, 'parts', 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(mapModelsToMakeTest).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/civic_del_sol?defaultImage=noimage',
          link: '/honda/civic-del-sol',
          text: 'Honda Civic del Sol parts',
        }]);
    });
  });

  describe('mapMakesToPart(String part = ``, Array makes = {}, String domain = ``)', () => {
    const test0 = Formatter.mapMakesToPart('bumper', makesCollection, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/acura?defaultImage=noimage',
          link: '/bumper/acura',
          text: 'Acura bumper',
        }]);
    });
  });

  describe('mapMakeModelPartToMakePart(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test0 = Formatter.mapMakeModelPartToMakePart('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });


  describe('mapRelParts(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test0 = Formatter.mapRelParts('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });

  describe('mapRelMakeParts(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test0 = Formatter.mapRelMakeParts('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });

  describe('mapRelMakeModelParts(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test0 = Formatter.mapRelMakeModelParts('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });

  describe('mapRelYearMakeModelParts(String map = ``, Array parts = {}, String domain = ``)', () => {
    const test0 = Formatter.mapRelYearMakeModelParts('honda', collection1, 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/honda/4wd-actuator',
          text: 'Honda 4WD Actuator',
        }]);
    });
  });

  describe('mapSingle(Array collection = {}, String key = ``, String domain = ``, Object options = {})', () => {
    const test0 = Formatter.mapSingle(collection1, 'part_name', 'carparts.com');
    it('Should be equal to the expected output', () => {
      expect(test0).to.deep.equal([
        {
          image: 'https://imgs.cpsimg.com/is/image/Autos/4wd_actuator?defaultImage=noimage',
          link: '/4wd-actuator',
          text: '4WD Actuator',
        }]);
    });
  });
});
