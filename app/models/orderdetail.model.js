module.exports = (sequelize, Sequelize) => {
  const Orderdetail = sequelize.define("orderdetail", {
    key: {
      type: Sequelize.STRING,
    },
    checked :{
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
  });
  return Orderdetail;
};
