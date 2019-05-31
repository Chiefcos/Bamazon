// We require mysql and inquirer
var mysql = require("mysql");
var inquirer = require("inquirer");

// We create a connection to the mysql server
var connection = mysql.createConnection({
  // the host name
  host: "localhost",

  // the port we use to connect to
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "yourRootPassword",
  // Your database
  database: "bamazon"
});

// We connect to the sql server here
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  // We run the function to start the application
  promptMenu();
});

// This function prompts a menu
function promptMenu() {
  inquirer
    .prompt([
      {
        name: "checkbox",
        message: "Choose your option",
        type: "list",
        // These are the choices of the menu
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product",
          "Exit"
        ]
      }
    ])
    .then(function(res) {
      // depending on the choice this is the switch board that connects you to the function needed
      switch (res.checkbox) {
        case "View Products for Sale":
          productsForSale();
          break;
        case "View Low Inventory":
          lowInventory();
          break;
        case "Add to Inventory":
          addToInventory();
          break;
        case "Add New Product":
          addNewProduct();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
}

// this function shows the products for sale
function productsForSale() {
  connection.query("SELECT * FROM products", function(err, data) {
    if (err) throw err;
    for (let i = 0; i < data.length; i++) {
      console.log(
        "\n --------------------------------",
        "\n ID: " + data[i].item_id,
        "\n Product: " + data[i].product_name,
        "\n Price: $" + data[i].price,
        "\n Quantity: " + data[i].stock_quantity,
        "\n --------------------------------\n"
      );
    }

    promptMenu();
  });
}

// This function checks whatever product as a stock that is lower than 5
function lowInventory() {
  connection.query("SELECT * FROM products", function(err, data) {
    if (err) throw err;
    for (let i = 0; i < data.length; i++) {
      var stock = data[i].stock_quantity;
      if (stock < 5) {
        console.log(
          "\n --------------------------------",
          "\n Product: " + data[i].product_name,
          "\n Quantity: " + data[i].stock_quantity,
          "\n --------------------------------\n"
        );
        promptMenu();
      }
    }
    if (stock > 5) {
      console.log(
        "\n --------------------------------",
        "\n No Low Inventory Present, You are Fully Packed",
        "\n --------------------------------\n"
      );
      promptMenu();
    }
  });
}

// This function will let you add inventory to the products in the database
function addToInventory() {
  connection.query("SELECT * FROM products", function(err, data) {
    if (err) throw err;
    // we use this container
    var items = [];
    for (let i = 0; i < data.length; i++) {
      // to store all the product names in our database
      items.push(data[i].product_name);
    }
    inquirer
      .prompt([
        {
          // We ask which product they want to add more inventory too
          name: "item",
          message: "Add more",
          type: "rawlist",
          choices: items
        },
        {
          // We ask how much stock we want to add
          name: "amount",
          message: "How many?",
          // We validate the result (to make sure it is a number more than 0)
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
        // These are the variables we use to store the users input
        var updatedStock = 0;
        var item = res.item;
        var amount = parseInt(res.amount);
        // We connect to the database
        connection.query(
          "SELECT * FROM products WHERE ?",
          [
            {
              // select the product the user choose to add inventory too
              product_name: item
            }
          ],
          function(err, data) {
            if (err) throw err;
            for (let i = 0; i < data.length; i++) {
              // We take the stock inside the database and add the user input too it
              updatedStock = data[i].stock_quantity + amount;
              // We run update stock
              updateStock(updatedStock, item);
            }
          }
        );
      });
  });
}

// We will update the database with the added stock
function updateStock(updatedStock, item) {
  // We connect to the database
  connection.query(
    "UPDATE products SET ? WHERE ? ",
    [
      {
        // update the stock with the values from the user
        stock_quantity: updatedStock
      },
      {
        // on the product the user selected
        product_name: item
      }
    ],
    function(err, data) {
      if (err) throw err;
      // We run restocked
      restocked(item);
    }
  );
}

// This function shows the new inventory with the corresponding product name
function restocked(item) {
  // We connect to the database
  connection.query(
    "SELECT * FROM products WHERE ?",
    [
      {
        // look for the users input product
        product_name: item
      }
    ],
    function(err, data) {
      if (err) throw err;
      // We show the product name and its new inventory amount
      console.log(
        "\n --------------------------------",
        "\n Product: " + data[0].product_name,
        "\n New Inventory Amount: " + data[0].stock_quantity,
        "\n --------------------------------\n"
      );
      promptMenu();
    }
  );
}

// This function, as you might as well guess, adds a new product to the database
function addNewProduct() {
  inquirer
    .prompt([
      {
        // We prompt the user with the question what product he wants to add
        name: "product",
        message: "What product would you like to add?"
      },
      {
        // What department the new product belongs too
        name: "department",
        message: "What department does this product belong too"
      },
      {
        // What the price is for the new product
        name: "price",
        message: "What is the price for the product?",
        // We validate that it is a number higher than 0
        validate: function(value) {
          if (isNaN(value) === true && parseInt(value) < 0) {
            return false;
          } else {
            return true;
          }
        }
      },
      {
        // How much stock we have for the new product
        name: "quantity",
        message: "How much do you have in stock ?"
      }
    ])
    .then(function(res) {
      // We show the info of what you just put in
      console.log(
        "\nNew Product added",
        "\n -------------------------",
        "\n Name: " + res.product,
        "\n Department: " + res.department,
        "\n Price: " + res.price,
        "\n Quantity: " + res.quantity,
        "\n -------------------------"
      );
      // We insert all the data into the database
      connection.query("INSERT INTO products SET ?", [
        {
          product_name: res.product,
          department_name: res.department,
          price: res.price,
          stock_quantity: res.quantity
        }
      ]);
      promptMenu();
    });
}
