import Sequelize from 'sequelize';
import Db from '../core/Db';


const sequelize = new Sequelize('ProductLookupDb_merge_optimized', 'hydra', 'gh56vn', {
  host: '10.10.75.236',
  dialect: 'mysql',
});

export default class Make extends Sequelize.Model {}
Make.init({
  // attributes
  model_name: {
    type: Sequelize.STRING,
    allowNull: false,
    get() {
      const modelName = this.getDataValue('model_name');
      // 'this' allows you to access attributes of the instance
      return `${this.getDataValue('model_name')} (${modelName})`;
    },
  },
  model_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'make',
  // options
});
