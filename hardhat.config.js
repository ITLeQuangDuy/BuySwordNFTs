require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    etherscan: {
      url: "https://eth-goerli.public.blastapi.io",
      accounts: [process.env.PRIV_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.API_KEY
  },
};
