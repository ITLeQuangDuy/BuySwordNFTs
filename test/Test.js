// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { mine } = require("@nomicfoundation/hardhat-network-helpers");
// const {Signer} = require("ethers");

// describe("Test ==============", async function(){
//     let owner;
//     let signer;
//     let signer1;
//     let contractERC1155;
//     let contractAdmin;
//     let contractTest;
//     it("Deploy",async function () { 
//         [owner, signer, signer1, signer2] = await ethers.getSigners();

//         const ContractERC1155 = await ethers.getContractFactory("ContractERC1155");
//         contractERC1155 = await ContractERC1155.deploy();

//         const ContractAdmin = await ethers.getContractFactory("ContractAdmin");
//         contractAdmin = await ContractAdmin.deploy(contractERC1155.target);

//         const ContractTest = await ethers.getContractFactory("ContractTest");
//         contractTest = await ContractTest.deploy(contractERC1155.target);
//     });

//     //-----------------------------------------------------------------
//     //////////////////////////////////////////////////////////

//     it("Test administrator 1", async function(){
//         await contractERC1155.connect(owner).setAdmin(contractAdmin.target);
//         await contractAdmin.connect(owner).mint(1, 10);
//         console.log("Balance of", await contractERC1155.balanceOf(owner, 1));
//         await contractTest.connect(owner).mint(1, 10);
//     });

//     it("Test administrator 2", async function(){
        
//     });
    
// });