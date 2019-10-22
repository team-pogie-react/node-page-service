export default (sequelize, type) => sequelize.define('toplevel_category', {
  tlc_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tlc_name: type.STRING,
},
{
  freezeTableName: true,
});
