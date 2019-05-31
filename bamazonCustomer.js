// We require mysql and inquirer
var mysql = require("mysql");
var inquirer = require("inquirer");

// Create a connection with a sql server
var connection = mysql.createConnection({
  // the host name
  host: "localhost",

  // The port used to make a connection
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "yourRootPassword",
  // Database name
  database: "bamazon"
});

// We connect to the sql server
connection.connect(function(err) {
  if (err) throw err;
  // We get a id which shows us the connection number
  console.log("connected as id " + connection.threadId + "\n");
  // run the function for displaying the inventory
  displayInventory();
});

// We display the inventory of Bamazon
function displayInventory() {
  connection.query("SELECT * FROM products", function(err, data) {
    if (err) throw err;
    // We loop throught the data array to show the information we need
    for (let i = 0; i < data.length; i++) {
      console.log(
        "\n --------------------------------",
        "\n ID: " + data[i].item_id,
        "\n Product: " + data[i].product_name,
        "\n Price: $" + data[i].price,
        "\n --------------------------------\n"
      );
    }
    // We call the point of sale function
    pointOfSale();
  });
}

// This function is our cash register, It asks what you want to buy and how many of the item selected
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

      //   We match the input with the corresponding ID in the database
      connection.query(
        "SELECT * FROM products WHERE ?",
        [
          {
            item_id: id
          }
        ],
        function(err, data) {
          if (err) throw err;
          // We check if we have enough of this item to make a sale
          sufficientStock(data, quantity, id);
        }
      );
    });
}
// this function checks the stock of the item you want to buy
function sufficientStock(data, quantity, id) {
  for (let i = 0; i < data.length; i++) {
    var stock = data[i].stock_quantity;
    // We check if the databases stock is bigger then the order
    if (stock < quantity) {
      console.log("Insufficient quantity!");
      connection.end();
      //   if it is bigger we run the order
    } else {
      // We subtract the order from our stock
      stock -= quantity;
      // We change the stock inside the database for the ID of the product
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
          // We run a function that will show is how much we have left of this item
          stockCheck(id, quantity);
        }
      );
    }
  }
}
// stock check shows us the stock after the sale
function stockCheck(id, quantity) {
  // We use the ID of the product that was sold to find out the stock in the database
  connection.query(
    "SELECT * FROM products WHERE ?",
    [
      {
        item_id: id
      }
    ],
    function(err, data) {
      if (err) throw err;
      // We display the remaining stock
      for (let i = 0; i < data.length; i++) {
        console.log(
          "\n --------------------------------",
          "\n Remaining stock: " + data[i].stock_quantity,
          "\n --------------------------------\n"
        );
        // We calculate the gross revenue (price * quantity)
        var totalCost = data[i].price * quantity;
        // We show the customer the total costs
        console.log("Your total costs are: $" + totalCost);
      }
      // We log the sale to the database
      productSales(data, totalCost, id);
    }
  );
}
// We want to store the gross revenue to the database
function productSales(data, totalCost, id) {
  // we take whatever the product sale was and add the gross revenue
  var productSale = totalCost + data[0].product_sales;
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        product_sales: productSale
      },
      {
        item_id: id
      }
    ],
    function(err, data) {
      if (err) throw err;
      connection.end();
    }
  );
}
