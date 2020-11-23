const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);

db.products = require("./product.model.js")(sequelize, Sequelize);
db.customers = require("./customer.model.js")(sequelize, Sequelize);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.orderdetails = require("./orderdetail.model.js")(sequelize, Sequelize);
db.checks = require("./check.model.js")(sequelize, Sequelize);

db.orders.hasMany(db.orderdetails, { as: "orderdetails" });
db.orderdetails.belongsTo(db.orders, {
  foreignKey: "orderId",
  as: "order",
});

db.customers.hasMany(db.orders, { as: "orders" });
db.orders.belongsTo(db.customers, {
  foreignKey: "customerId",
  as: "customer",
});

db.products.hasMany(db.orders, { as: "orders" });
db.orders.belongsTo(db.products, {
  foreignKey: "productId",
  as: "product",
});

db.orderdetails.hasMany(db.checks, { as: "checks" });
db.checks.belongsTo(db.orderdetails, {
  foreignKey: "orderdetailId",
  as: "orderdetail",
});





module.exports = db;
