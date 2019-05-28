var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "yourRootPassword",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  displayInventory();
});

function displayInventory() {
  connection.query("SELECT * FROM products", function(err, data) {
    if (err) throw err;
    for (let i = 0; i < data.length; i++) {
      console.log(
        "\n --------------------------------",
        "\n ID: " + data[i].item_id,
        "\n Product: " + data[i].product_name,
        "\n Price: $" + data[i].price,
        "\n --------------------------------\n"
      );
    }
    pointOfSale();
  });
}

function pointOfSale() {
  inquirer
    .prompt([
      {
        name: "id",
        message: "What is the ID of the product you would like to purchase?",
        validate: function(res) {
          if (isNaN(res) === true && parseInt(res) < 0) {
            return false;
          } else {
            return true;
          }
        }
      },
      {
        name: "quantity",
        message: "How many would you like?",
        validate: function(res) {
          if (isNaN(res) === true && parseInt(res) < 0) {
            return false;
          } else {
            return true;
          }
        }
      }
    ])
    .then(function(res) {
      // We take the input and turn them into numbers
      var id = parseInt(res.id);
      var quantity = parseInt(res.quantity);
      console.log();

      //   We match the input with the proper ID in the database
      connection.query(
        "SELECT * FROM products WHERE ?",
        [
          {
            item_id: id
          }
        ],
        function(err, data) {
          if (err) throw err;
          sufficientStock(data, quantity, id);
        }
      );
    });
}

function sufficientStock(data, quantity, id) {
  for (let i = 0; i < data.length; i++) {
    var stock = data[i].stock_quantity;
    console.log(stock);
    // We check if the databases stock is bigger then the order
    if (stock < quantity) {
      console.log("Insufficient quantity!");
      connection.end();
      //   if it is bigger we run the order
    } else {
      stock -= quantity;
      connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: stock
          },
          {
            item_id: id
          }
        ],
        function(err, data) {
          if (err) throw err;
          console.log("I'm the data " + data);
          console.log(id);
          stockCheck(id, quantity);
        }
      );
    }
  }
}

function stockCheck(id, quantity) {
  connection.query(
    "SELECT * FROM products WHERE ?",
    [
      {
        item_id: id
      }
    ],
    function(err, data) {
      if (err) throw err;
      for (let i = 0; i < data.length; i++) {
        console.log(
          "\n --------------------------------",
          "\n Remaining stock: " + data[i].stock_quantity,
          "\n --------------------------------\n"
        );
        var totalCost = data[i].price * quantity;
        console.log("Your total costs are: $" + totalCost);
      }
      connection.end();
    }
  );
}
