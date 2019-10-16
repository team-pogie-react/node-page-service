/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import Url from '../../../../../../src/core/library/seo/url/url';

const urlFormatter = new Url();

describe('Seo Url Formatter:', () => {
  describe('Url.encode()', () => {
    it('Url.encode: k-n shoud be equal to k-and-n', () => {
      expect(urlFormatter.encode('k-n')).to.be.equal('k-and-n');
    });

    it('Url.encode: "-comma-" shoud be equal to "" ', () => {
      expect(urlFormatter.encode('-comma-')).to.be.equal('');
    });

    it('Url.encode: "vaip---vision" shoud be equal to "vaip-vision"', () => {
      expect(urlFormatter.encode('vaip---vision')).to.be.equal('vaip-vision');
    });

    it('Url.encode: "&" shoud be equal to "-and-"', () => {
      expect(urlFormatter.encode('&')).to.be.equal('-and-');
    });

    it('Url.encode: " & " shoud be equal to "-and-"', () => {
      expect(urlFormatter.encode(' & ')).to.be.equal('-and-');
    });

    it('Url.encode: "Replacement Wheel Arch Repair Panel" shoud be equal to "wheel-arch repair panel"', () => {
      expect(urlFormatter.encode('Replacement Wheel Arch Repair Panel')).to.be.equal('replacement-wheel-arch-repair-panel');
    });


    it('Url.encode: "A/C Compressor" shoud be equal to "a-c-ompressor"', () => {
      expect(urlFormatter.encode('A/C Compressor')).to.be.equal('a-c-compressor');
    });


    it('Url.encode: " " shoud be equal to "-"', () => {
      expect(urlFormatter.encode(' ')).to.be.equal('-');
    });
  });
});
