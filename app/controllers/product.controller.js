const db = require("../models");
const Product = db.products;
const Customer = db.customers;
const Order = db.orders;
const Orderdetails = db.orderdetails;
const Check = db.checks;
const Op = db.Sequelize.Op;

const { getPagingData } = require("./pagination")
// Create and Save a new Product
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title || !req.body.url) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Product
  const product = {
    title: req.body.title,
    url: req.body.url,
    designer: req.body.designer ? req.body.designer : "General Release"
  };

  // Save Product in the database
  Product.create(product)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Product."
      });
    });
};

// Retrieve all Products from the database.
exports.findAll = (req, res) => {
  console.log(req.query)
  const title = req.query.title;
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Product.findAndCountAll({
    where: condition,
    limit: perPage * 1,
    offset: perPage * (page - 1),
    order: [
      ['id', 'DESC']
    ]
  })
    .then(data => {
      const response = getPagingData(data, page, perPage);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving products."
      });
    });
};

exports.findAllProductCustomer = (req, res) => {
  const products = Product.findAll({ order: [['id', 'DESC']] });
  const customers = Customer.findAll({ order: [['id', 'DESC']] });
  Promise
    .all([products, customers])
    .then(responses => {
      res.send(responses);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving products and customers data."
      });
    });
}

// Find a single Product with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Product.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Product with id=" + id
      });
    });
};

// Update a Product by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Product.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Success"
        });
      } else {
        res.send({
          message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Product with id=" + id
      });
    });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.findOne({
    where: { id: id },
    include: [{
      model: Order,
      as: 'orders',
      include: [{
        model: Orderdetails,
        as: 'orderdetails',
        include: [{
          model: Check,
          as: 'checks'
        }]
      }]
    }]
  }).then((data) => {
    var orderIds = [];
    var orderdetailIds = [];
    var checkIds = [];
    data.orders.map((a) => {
      orderIds[orderIds.length] = a.id
      a.orderdetails.map((b) => {
        orderdetailIds[orderdetailIds.length] = b.id;
        b.checks.map((c) => {
          checkIds[checkIds.length] = c.id
        })
      })
    });
    Check.destroy({
      where: { id: checkIds }
    }).then(() => {
      Orderdetails.destroy({
        where: { id: orderdetailIds }
      }).then(() => {
        Order.destroy({
          where: { id: orderIds }
        }).then(() => {
          Product.destroy({ where: {id: id} })
            .then(() => {
              res.send({
                message: "Success"
              });
            })
        })
      })
    })
  })


};

// Delete all Products from the database.
exports.deleteAll = (req, res) => {
  Product.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Products were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all products."
      });
    });
};

// find all published Product
exports.findAllPublished = (req, res) => {
  Product.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving products."
      });
    });
};
