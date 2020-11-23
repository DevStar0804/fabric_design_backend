module.exports = (sequelize, Sequelize) => {
  const Check = sequelize.define("check", {
    ip_address: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    }
  });
  return Check;
};
