const config = require("config");

module.exports = function () {
  // console.log(config);
  if (!config.get("jwtPrivateKey")) {
    throw new Error("Fatal Error: jwtPrivateKey is not defined");
    process.exit(1);
  } else {
    console.log(config.get("jwtPrivateKey"));
  }
  console.log("hiii");
};
