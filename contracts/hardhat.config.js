require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan");
const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const {ETHERSCAN_API_KEY, ETHERSCAN_API_KEY_MUMBAI, URL_ALCHEMY_MUMBAI, URL_ALCHEMY_RINKEBY, URL_ALCHEMY_GOERLI} = process.env;

module.exports = {
  solidity: '0.8.10',
  networks: {
    mumbai: {
      url: URL_ALCHEMY_MUMBAI
    },
    rinkeby: {
      url: URL_ALCHEMY_RINKEBY
    },
    goerli: {
        url: URL_ALCHEMY_GOERLI
    }
  },
  etherscan: {
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY
      // mumbai: ETHERSCAN_API_KEY_MUMBAI
    }
  }
};