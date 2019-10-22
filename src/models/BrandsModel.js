export default (sequelize, type) => sequelize.define('brands', {
  brand_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  brand_name: type.STRING,
});
