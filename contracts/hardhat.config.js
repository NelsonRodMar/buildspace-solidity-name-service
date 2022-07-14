require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");
const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const {URL_ALCHEMY, ETHERSCAN_API_KEY} = process.env;

module.exports = {
  solidity: '0.8.10',
  networks: {
    polygonMumbai: {
      url: URL_ALCHEMY
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: ETHERSCAN_API_KEY,
    },
  },
};