const db = require("../models");
const Order = db.orders;
const Product = db.products;
const Customer = db.customers;
const Orderdetail = db.orderdetails;
const Check = db.checks;
const Op = db.Sequelize.Op;

// Create and Save a new Order
function makekey(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.create = (req, res) => {
  // Validate request
  if (!req.body.count) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Order
  // makekey(10);


  const order = {
    customerId: req.body.customerId,
    productId: req.body.productId,
    count: req.body.count,
    notes: req.body.notes,
  };

  // Save Order in the database
  Order.create(order)
    .then(data => {
      let temp = [];
      for (let i = 0; i < req.body.count; i++) {
        temp.push(Orderdetail.create({ orderId: data.dataValues.id, key: makekey(10) }));
      }
      Promise.all(temp).then(function (result) {
        res.send({ order: data, details: result })
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Order."
      });
    });
};

// Retrieve all Orders from the database.
exports.findAll = (req, res) => {
  // const from = req.query.from || null;
  // const to = req.query.to || Date.now();
  // var condition = { createdAt: { [Op.between]: [from, to] } };
  Order.findAll({
    order: [['id', 'DESC']],
    include: [{
      model: Product,
      as: 'product'
    }, {
      model: Customer,
      as: 'customer'
    }, {
      model: Orderdetail,
      as: 'orderdetails'
    }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders."
      });
    });
};

// Find a single Order with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Order.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Order with id=" + id
      });
    });
};

// Update a Order by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Order.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Order was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Order with id=${id}. Maybe Order was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Order with id=" + id
      });
    });
};

// Delete a Order with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  // Orderdetail.destroy({
  //   where: { orderId: id }
  // })
  //   .then(data => {
  //     if (data) {
  //       Order.destroy({
  //         where: { id: id }
  //       })
  //         .then(num => {
  //           if (num == 1) {
  //             res.send({
  //               message: "Success"
  //             });
  //           } else {
  //             res.send({
  //               message: `Cannot delete Order with id=${id}. Maybe Order was not found!`
  //             });
  //           }
  //         })
  //         .catch(err => {
  //           res.status(500).send({
  //             message: "Could not delete Order with id=" + id
  //           });
  //         });
  //     }
  //     else {
  //       res.send({
  //         message: `Can't delete Orderdetails with orderId=${id}`
  //       })
  //     }
  //   }).catch(err => {
  //     res.status(500).send({
  //       message: `Could not delete Orderdetails with orderId=${id}`
  //     })
  //   })

  Order.findOne({
    where: { id: id },
    include: [{
      model: Orderdetail,
      as: 'orderdetails',
      include: [{
        model: Check,
        as: 'checks'
      }]
    }]
  }).then((data) => {
    var orderdetailIds = [];
    var checkIds = [];
    data.orderdetails.map((b) => {
      orderdetailIds[orderdetailIds.length] = b.id;
      b.checks.map((c) => {
        checkIds[checkIds.length] = c.id
      })
    });
    Check.destroy({
      where: { id: checkIds }
    }).then(() => {
      Orderdetail.destroy({
        where: { id: orderdetailIds }
      }).then(() => {
        Order.destroy({
          where: { id: id }
        }).then(() => {
          res.send({
            message: "Success"
          });
        })
      })
    })
  })
};

// Delete all Orders from the database.
exports.deleteAll = (req, res) => {
  Order.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Orders were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all orders."
      });
    });
};

