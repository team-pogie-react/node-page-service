import Sequelize from 'sequelize';
import makeModel from '../models/MakesModel';
import modelModel from '../models/ModelsModel';
import partnameModel from '../models/PartnamesModel';
import brandModel from '../models/BrandsModel';
import categoryModel from '../models/CategoryModel';
import tlcModel from '../models/ToplevelcategoryModel';

const sequelize = new Sequelize('ProductLookupDb_merge_optimized', 'hydra', 'gh56vn', {
  host: '10.10.75.236',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: false,
  },
});


const Makes = makeModel(sequelize, Sequelize);
const Models = modelModel(sequelize, Sequelize);
const Partnames = partnameModel(sequelize, Sequelize);
const Brands = brandModel(sequelize, Sequelize);
const Category = categoryModel(sequelize, Sequelize);
const TLC = tlcModel(sequelize, Sequelize);
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
/* const BlogTag = sequelize.define('blog_tag', {})
const Blog = BlogModel(sequelize, Sequelize)
const Tag = TagModel(sequelize, Sequelize)

Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsTo(User);

sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  })
*/
export default {
  Makes,
  Models,
  Partnames,
  Brands,
  Category,
  TLC,
};
