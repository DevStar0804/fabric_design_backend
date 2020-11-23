module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("product", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    designer: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  return Product;
};
