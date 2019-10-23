export default (sequelize, type) => sequelize.define('products', {
  product_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sku: type.STRING,
});
