var geoip = require('geoip-lite');
const db = require("../models");
const Orderdetail = db.orderdetails;
const Order = db.orders;
const Product = db.products;
const Customer = db.customers;
const Check = db.checks;
const Op = db.Sequelize.Op;
exports.check = (req, res) => {
  var ip = req.ip;
  var geo = geoip.lookup(ip);
  if (!geo)
    geo = {city:"unknown",country:"unknown"}
  const key = req.body.key;
  // console.log(key)
  Orderdetail.findOne({
    where: { key: key },
    include: [{
      model: Order,
      as: 'order',
      include: [{
        model: Product,
        as: 'product'
      },
      {
        model: Customer,
        as: 'customer'
      }]
    }]
  })
    .then(data => {
      if (data) {
        // console.log(data);
        if (data.checked) {
          const check = Check.create({
            ip_address: ip,
            address: geo.city + ', ' + geo.country, 
            orderdetailId: data.id
          })
            .then((d) => {
              Check.findAll({
                where: { orderdetailId: data.id }
              })
                .then(aa => {
                  res.send({
                    message: 'Already checked',
                    data: [aa, { title: data.order.product.title, company: data.order.customer.company, url: data.order.product.url, key_code: data.key }]
                  })
                })
            }).catch(err => {
              res.send({
                message: 'Failed to retrieve all checked data',
                data: 'DB operation error'
              })
            }).catch(err => {
              res.send({
                message: 'Failed to insert check data',
                data: 'DB operation error'
              })
            })
        }
        else {
          const check = Check.create({
            ip_address: ip,
            address: geo.city + ', ' + geo.country,
            orderdetailId: data.id
          });
          const orderdetail = Orderdetail.update({ checked: true }, {
            where: { id: data.id }
          });
          Promise
            .all([check, orderdetail])
            .then(responses => {
              res.send({
                message: 'Success',
                data: { title: data.order.product.title, company: data.order.customer.company, url: data.order.product.url, key_code: data.key }
              })
            })
            .catch(err => {
              res.send({
                message: 'Failed to create checked info',
                data: 'DB operation error'
              });
            });
        }
      }
      else res.send({
        message: "Such keycode doesn't exits",
        data: 'not exist'
      });
    })
}