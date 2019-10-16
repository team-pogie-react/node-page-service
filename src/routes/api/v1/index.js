import { Router } from 'express';
import { concat } from 'lodash';
import pages from './pages';
import pagetype from './pagetype';
import brands from './brands';
import vehicles from './vehicles';
import categories from './categories';
import orders from './orders';
import checkout from './checkout';
import cart from './cart';
import accounts from './accounts';
import products from './products';
import search from './search';
import quickaddress from './quickaddress';
import directory from './directory';
import staticpages from './staticpages';
import nomatch from './nomatch';
import domainValidator from '../../../middlewares/api/domain-validator';
import ieCacheHeaders from '../../../middlewares/api/ie-cache-headers';


const routes = Router();

routes.use('/', concat(directory, pages));
routes.use('/categories', categories);
routes.use('/brands', brands);
routes.use('/vehicles', vehicles);
routes.use('/orders', orders);
routes.use('/cart', domainValidator, cart);
routes.use('/checkout', domainValidator, ieCacheHeaders, checkout);
routes.use('/accounts', domainValidator, ieCacheHeaders, accounts);
routes.use('/products', products);
routes.use('/search', search);
routes.use('/quickaddress', domainValidator, quickaddress);
routes.use('/static', staticpages);
routes.use('/pagetype', pagetype);
routes.use('/nomatch', nomatch);

export default routes;
