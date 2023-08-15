const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Sword", async function(){
    let myToken;
    let sword;
    let owner;
    let signer;
    it("Deploy",async function () { 
        [owner, signer, signer1, signer2] = await ethers.getSigners();
        
        const MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy("USDT Token", "USDT");

        const Sword = await ethers.getContractFactory("SwordNFTs");
        sword = await Sword.deploy();
    });

    it("Test AddRound 1", async function(){
        const timePresent = Math.floor(Date.now() / 1000);
        const _startTime = timePresent;
        const _endTime = timePresent + 1209600;
        const _maxNFTsPerUser = 10;
        const _totalNFTsInRound = 1000;
        const _newPrice = ["1000000000000000", "2000000000000000"];
        const _newTokenAddress = "0x0000000000000000000000000000000000000000";
        //console.log(_startTime, _endTime, _totalNFTsInRound, _maxNFTsPerUser, _newPrice, _newTokenAddress);

        await sword.addRound(_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrice, _newTokenAddress);
        const roundIndex = await sword.currentRound();
        //console.log("roundIndex", roundIndex);
        const round = await sword.rounds(roundIndex);
        //console.log(round);
    }); 

    it("Test AddRound 2", async function(){
        const timePresent = Math.floor(Date.now() / 1000);
        const _startTime = timePresent;
        const _endTime = timePresent + 604800;
        const _maxNFTsPerUser = 5;
        const _totalNFTsInRound = 500;
        const _newPrice = [ethers.parseEther("10"), ethers.parseEther("20")];
        const _newTokenAddress = await myToken.getAddress();
        console.log(_startTime, _endTime, _totalNFTsInRound, _maxNFTsPerUser, _newPrice, _newTokenAddress);

        await sword.addRound(_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrice, _newTokenAddress);
        const roundIndex = await sword.currentRound();
        console.log("roundIndex", roundIndex);
        const round = await sword.getRound(roundIndex);
        console.log(round);
    });
    
    it("Test SetTimeOnSaleNextRound", async function(){
        const setTime = 10000;
        await sword.setTimeOnSaleNextRound(setTime);
        const timeOnSaleUpdate = await sword.timeNextRound;
        console.log("aaa", await sword.timeNextRound);
        //expect(timeOnSaleUpdate).to.equal(setTime);
    });
});