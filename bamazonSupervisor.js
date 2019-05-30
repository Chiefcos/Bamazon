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
    menuPrompt();
  });

function menuPrompt(){
    inquirer.prompt([{
        name: "checkbox",
        message: "Choose your option",
        type: "checkbox",
        choices: ["View Product Sales by Department", "Create New Department"]
    }]).then(function (value){
        if (value.checkbox === "View Product Sales by Department"){
            connection.query("SELECT (departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales, t ")
        } else {
            connection.query()
        }
    })
}