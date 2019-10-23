export default (sequelize, type) => sequelize.define('years', {
  year_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  year: type.STRING,
});
