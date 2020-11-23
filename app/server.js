const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path")
const app = express();
const history = require('connect-history-api-fallback');

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

var corsOptions = {
  origin: "*"
};
app.use(history());
// app.use(history({
//   rewrites:[
//       {from: /^\/api\/.*$/, to: function(context){
//           return context.parsedUrl.pathname;
//       }},
//       {from: /\/.*/, to: '/'}
//   ]
// }))


app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

app.use(express.static("build"))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");

db.sequelize.sync();
// drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
});

require("./routes/turorial.routes")(app);
require("./routes/product.routes")(app);
require("./routes/customer.routes")(app);
require("./routes/order.routes")(app);
require("./routes/check.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
