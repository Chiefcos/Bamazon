var num = "Twenty";
var numTwo = "20";

var numCheck = parseInt(num);
var numCheckTwo = parseInt(numTwo);

console.log(numCheckTwo);

if (isNaN(numCheckTwo) === true && parseInt(numCheckTwo) < 0) {
  console.log("true");
} else {
  console.log("false");
}
