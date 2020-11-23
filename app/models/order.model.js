module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    notes: {
      type: Sequelize.STRING,
    },
    count: {
      type: Sequelize.INTEGER,
    }
  });
  return Order;
};
