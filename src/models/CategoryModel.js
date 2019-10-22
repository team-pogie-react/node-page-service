export default (sequelize, type) => sequelize.define('category', {
  cat_id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cat_name: type.STRING,
},
{
  freezeTableName: true,
});
