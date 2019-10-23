export default (sequelize, type) => sequelize.define('submodels', {
  submodel_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  submodel_name: type.STRING,
});
