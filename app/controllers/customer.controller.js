const db = require("../models");
const Customer = db.customers;
const Op = db.Sequelize.Op;
const Product = db.products;
const Order = db.orders;
const Orderdetails = db.orderdetails;
const Check = db.checks;


const { getPagingData } = require("./pagination")
// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body.company || !req.body.email || !req.body.address || !req.body.phone || !req.body.first_name || !req.body.last_name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Customer
  const customer = {
    company: req.body.company,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
  };

  // Save Customer in the database
  Customer.create(customer)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Customer."
      });
    });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  const company = req.query.company;
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  var condition = company ? { company: { [Op.like]: `%${company}%` } } : null;

  Customer.findAndCountAll({
    where: condition,
    limit: perPage,
    offset: perPage * (page - 1)
  })
    .then(data => {
      const response = getPagingData(data, page, perPage);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    });
};

// Find a single Customer with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Customer.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Customer with id=" + id
      });
    });
};

// Update a Customer by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Customer.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Success"
        });
      } else {
        res.send({
          message: `Cannot update Customer with id=${id}. Maybe Customer was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Customer with id=" + id
      });
    });
};

// Delete a Customer with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Customer.findOne({
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
          Customer.destroy({ where: { id: id } })
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

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
  Customer.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Customers were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers."
      });
    });
};

// find all published Customer
exports.findAllPublished = (req, res) => {
  Customer.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    });
};
