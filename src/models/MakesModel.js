export default (sequelize, type) => sequelize.define('make', {
  make_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  make_name: type.STRING,
});
