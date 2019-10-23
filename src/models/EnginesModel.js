export default (sequelize, type) => sequelize.define('lookup_engines', {
  engine_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cylinders: type.STRING,
  liter: type.STRING,
});
