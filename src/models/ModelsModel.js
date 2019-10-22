export default (sequelize, type) => sequelize.define('models', {
  model_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  model_name: type.STRING,
});
