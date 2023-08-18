// const { ethers } = require("hardhat");

// const deployToken = async () => {
//     const MyToken = await ethers.getContractFactory("MyToken");
//     myToken = await MyToken.deploy("USDT Token", "USDT");
//     console.log("Token address:", await myToken.getAddress());
// }

// const deployBuySword = async () => {
//     const SwordNFTs = await ethers.getContractFactory("SwordNFTs");
//     swordNFTs = await SwordNFTs.deploy();
//     console.log("Sword address:", await swordNFTs.getAddress());
// }

// async function main() {
//     const [deployer] = await ethers.getSigners();

//     await deployToken;
//     await deployBuySword;
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });