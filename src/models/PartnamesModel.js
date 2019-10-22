export default (sequelize, type) => sequelize.define('partnames', {
  part_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  part_name: type.STRING,
});
