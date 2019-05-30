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
  promptMenu();
});

function promptMenu() {
  inquirer
    .prompt([
      {
        name: "checkbox",
        message: "Choose your option",
        type: "checkbox",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(res) {
      switch (res.checkbox[0]) {
        case "View Products for Sale":
          connection.query("SELECT * FROM products", function(err, data) {
            if (err) throw err;
            console.log(
              "\n --------------------------------",
              "\n ID: " + data[i].item_id,
              "\n Product: " + data[i].product_name,
              "\n Price: $" + data[i].price,
              "\n Quantity: " + data[i].stock_quantity,
              "\n --------------------------------\n"
            );
          });
          connection.end();
          break;
        case "View Low Inventory":
          connection.query("SELECT * FROM products", function(err, data) {
            if (err) throw err;
            for (let i = 0; i < data.length; i++) {
              if (data[i].stock_quantity < 5) {
                console.log(
                  "\n --------------------------------",
                  "\n Product: " + data[i].product_name,
                  "\n Quantity: " + data[i].stock_quantity,
                  "\n --------------------------------\n"
                );
              }
            }
          });
          connection.end();
          break;
        case "Add to Inventory":
          connection.query("SELECT * FROM products", function(err, data) {
            if (err) throw err;
            var items = [];
            for (let i = 0; i < data.length; i++) {
              items.push(data[i].product_name);
            }
            inquirer
              .prompt([
                {
                  name: "item",
                  message: "Add more",
                  type: "rawlist",
                  choices: items
                },
                {
                  name: "amount",
                  message: "How many?",
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
                var updatedStock = 0;
                var item = res.item;
                var amount = parseInt(res.amount);
                connection.query(
                  "SELECT * FROM products WHERE ?",
                  [
                    {
                      product_name: item
                    }
                  ],
                  function(err, data) {
                    if (err) throw err;
                    for (let i = 0; i < data.length; i++) {
                      updatedStock = data[i].stock_quantity + amount;
                      updateStock(updatedStock, item);
                    }
                  }
                );
              });
          });
          break;
        case "Add New Product":
          inquirer
            .prompt([
              {
                name: "product",
                message: "What product would you like to add?"
              },
              {
                name: "department",
                message: "What department does this product belong too"
              },
              {
                name: "price",
                message: "What is the price for the product?",
                validate: function(value) {
                  if (isNaN(value) === true && parseInt(value) < 0) {
                    return false;
                  } else {
                    return true;
                  }
                }
              },
              {
                name: "quantity",
                message: "How much do you have in stock ?"
              }
            ])
            .then(function(res) {
              console.log(
                "\nNew Product added",
                "\n -------------------------",
                "\n Name: " + res.product,
                "\n Department: " + res.department,
                "\n Price: " + res.price,
                "\n Quantity: " + res.quantity,
                "\n -------------------------"
              );
              connection.query("INSERT INTO products SET ?", [
                {
                  product_name: res.product,
                  department_name: res.department,
                  price: res.price,
                  stock_quantity: res.quantity
                }
              ]);

              connection.end();
            });
          break;
      }
    });
}
function updateStock(updatedStock, item) {
  connection.query(
    "UPDATE products SET ? WHERE ? ",
    [
      {
        stock_quantity: updatedStock
      },
      {
        product_name: item
      }
    ],
    function(err, data) {
      if (err) throw err;
      restocked(item);
    }
  );
}

function restocked(item) {
  connection.query(
    "SELECT * FROM products WHERE ?",
    [
      {
        product_name: item
      }
    ],
    function(err, data) {
      if (err) throw err;
      console.log(
        "\n --------------------------------",
        "\n Product: " + data[0].product_name,
        "\n New Inventory Amount: " + data[0].stock_quantity,
        "\n --------------------------------\n"
      );
      connection.end();
    }
  );
}
