const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    // const MyToken = await ethers.getContractFactory("MyToken");
    // const myToken = await MyToken.deploy("USDT Token", "USDT");

    // const ContractERC1155 = await ethers.getContractFactory("ContractERC1155");
    // const contractERC1155 = await ContractERC1155.deploy();

    const BuySword = await ethers.getContractFactory("SwordNFTs");
    const buySword = await BuySword.deploy("0xBDC72757A2eFC7B71D41F005872ee1276989F92a");

    // console.log("MyToken deployed to:", myToken.address, myToken.target);
    // console.log("ContractERC1155", contractERC1155.target);
    console.log("buySword", buySword.target)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
