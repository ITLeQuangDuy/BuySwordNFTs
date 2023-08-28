const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const {Signer} = require("ethers");

describe("Test Sword", async function(){
    let myToken;
    let sword;
    let owner;
    let signer;
    let signer1;
    let tokenAddr;
    let contractAddr;
    let contractERC1155;
    it("Deploy",async function () { 
        [owner, signer, signer1, signer2] = await ethers.getSigners();
        
        const MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy("USDT Token", "USDT");

        const ContractERC1155 = await ethers.getContractFactory("ContractERC1155");
        contractERC1155 = await ContractERC1155.deploy()

        const Sword = await ethers.getContractFactory("SwordNFTs");
        sword = await Sword.deploy(contractERC1155.target);

        tokenAddr = myToken.target;
        contractAddr = sword.target;
    });

    //-----------------------------------------------------------------
    /////////////////////////ADD ROUND/////////////////////////////////

    it("AddRound 1", async function(){
        const _startTime = 1692122400;
        const _endTime = 1693332000;
        const _maxNFTsPerUser = 10;
        const _totalNFTsInRound = 1000;
        const _newPrices = [1000000000000000, 2000000000000000];
        const _newTokenAddress = "0x0000000000000000000000000000000000000000";
        const _newTotalSupply = 0;

        await sword.addRound(_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrices, _newTokenAddress, _newTotalSupply);
        
        const roundIndex = await sword.currentRound();
        const round = await sword.getRound(roundIndex);
        expect(round.startTime).to.equal(_startTime);
        expect(round.endTime).to.equal(_endTime);
        expect(round.maxNFTsPerUser).to.equal(_maxNFTsPerUser);
        expect(round.totalNFTsInRound).to.equal(_totalNFTsInRound);
        expect(round.prices).to.deep.equal(_newPrices);
        expect(round.tokenAddress).to.equal(_newTokenAddress);
    }); 

    it("AddRound 2", async function(){
        const _startTime = 1693936800;
        const _endTime = 1694541600;
        const _maxNFTsPerUser = 5;
        const _totalNFTsInRound = 500;
        const _newPrice = [ethers.parseEther("10"), ethers.parseEther("20")];
        const _newTokenAddress = tokenAddr;
        const _newTotalSupply = 0;
        await sword.addRound(_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrice, _newTokenAddress, _newTotalSupply);

        const roundIndex = await sword.currentRound();
        const round = await sword.getRound(roundIndex);

        expect(round.startTime).to.equal(_startTime);
        expect(round.endTime).to.equal(_endTime);
        expect(round.maxNFTsPerUser).to.equal(_maxNFTsPerUser);
        expect(round.totalNFTsInRound).to.equal(_totalNFTsInRound);
        expect(round.prices).to.deep.equal(_newPrice);
        expect(round.tokenAddress).to.equal(_newTokenAddress);
        expect(round.totalSupply).to.equal(_newTotalSupply);
    });

    it("AddRound 3", async function(){
        const _startTime = 1692291600;
        const _endTime = 1692896400;
        const _maxNFTsPerUser = 3;
        const _totalNFTsInRound = 5;
        const _newPrice = [ethers.parseEther("10"), ethers.parseEther("20")];
        const _newTokenAddress = "0x0000000000000000000000000000000000000000";
        const _newTotalSupply = 0;

        await sword.connect(owner).addRound(_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrice, _newTokenAddress, _newTotalSupply);
        const roundIndex = await sword.currentRound();
        const round = await sword.getRound(roundIndex);

        expect(round.startTime).to.equal(_startTime);
        expect(round.endTime).to.equal(_endTime);
        expect(round.maxNFTsPerUser).to.equal(_maxNFTsPerUser);
        expect(round.totalNFTsInRound).to.equal(_totalNFTsInRound);
        expect(round.prices).to.deep.equal(_newPrice);
        expect(round.tokenAddress).to.equal(_newTokenAddress);
        expect(round.totalSupply).to.equal(_newTotalSupply);
    });

    //-----------------------------------------------------------------
    /////////////////////////BUY NFTs/////////////////////////////////

    //ngoai le
    it("Buy NFTs with ether Only admin can call this function", async function(){
        const quantity = 2;
        const tokenId = 0;
        const roundIndex = 1;
        const round = await sword.getRound(roundIndex);
        const price =round.prices[tokenId];

        await sword.connect(owner).setRoundIndex(roundIndex);
        await expect (sword.connect(owner).buyNFT(quantity, tokenId, {value : BigInt(quantity) * price})).to.be.revertedWith("Only admin can call this function");
    });

    it("Buy NFTs with ether", async function(){
        const quantity = 2;
        const tokenId = 0;
        const roundIndex = 1;
        const round = await sword.getRound(roundIndex);
        const price =round.prices[tokenId];
        const tokenIDBefore = await contractERC1155.balanceOf(owner.address, tokenId);

        await sword.connect(owner).setRoundIndex(roundIndex);

        const etherBefore = await ethers.provider.getBalance(owner.getAddress());
        await contractERC1155.connect(owner).setAdmin(sword.target);
        const tx = await sword.connect(owner).buyNFT(quantity, tokenId, {value : BigInt(quantity) * price});
        const res = await tx.wait();
        const etherAfter = await ethers.provider.getBalance(owner.getAddress());
        const totalGas = etherBefore - etherAfter;
        const total = BigInt(res.gasPrice) * res.gasUsed + tx.value;
        const tokenIdAfter = await contractERC1155.balanceOf(owner.address, tokenId);

        expect(total).to.equal(totalGas);
        expect(tokenIDBefore + BigInt(quantity)).to.equal(tokenIdAfter);
    });

    it("Buy NFTs with token coin Not enough native coin", async function(){
        await expect (sword.connect(signer).buyNFT(3, 1,{value : 10})).to.be.revertedWith("Not enough native coin");
    });

    it("Buy NFTs Max quantity in round", async function(){
        const quantity = 2;
        const tokenId = 0;
        const roundIndex = 3;
        const round = await sword.getRound(roundIndex);
        const price = round.prices[tokenId];

        await sword.connect(owner).setRoundIndex(roundIndex);
        await sword.connect(signer).buyNFT(quantity, tokenId, {value: BigInt(quantity) * price});
        await sword.connect(signer1).buyNFT(3, tokenId, {value: BigInt(3) * price});
        await expect (sword.connect(signer2).buyNFT(3, tokenId, {value: BigInt(3) * price})).to.be.revertedWith("Max quantity in round");
    });

    it("Buy NFTs Invalid tokenId", async function(){
        
        const quantity = 2;
        const tokenId = 0;
        const round = await sword.getRound(1);
        const price = round.prices[tokenId];
        await sword.connect(owner).setRoundIndex(1);
        await expect(sword.connect(owner).buyNFT( 2, 3, {value: BigInt(quantity) * price})).to.be.revertedWith("Invalid tokenId");
    });

    it("Buy NFTs Not time on sale", async function(){
        const duration = 1209605;

        await ethers.provider.send("evm_increaseTime", [duration]);
        
        const quantity = 2;
        const tokenId = 0;

        await sword.connect(owner).setRoundIndex(2);
        await expect(sword.connect(owner).buyNFT( 0, 3)).to.be.revertedWith("Not time on sale");
    });

    it("Buy NFTs Pass time on sale", async function(){
        const duration = 604800;

        await ethers.provider.send("evm_increaseTime", [duration])

        const quantity = 2;
        const tokenId = 0;
        const round = await sword.getRound(1);
        const price = round.prices[tokenId];
        
        await sword.connect(owner).setRoundIndex(1);
        await expect(sword.connect(owner).buyNFT( 2, 3,{value: BigInt(quantity) * price})).to.be.revertedWith("Pass time on sale");
    });

    it("Buy NFTs with token coin", async function(){
        const quantity = 2;
        const tokenId = 1;
        const roundIndex = 2;
        const round = await sword.getRound(roundIndex);
        const price = round.prices[tokenId];
        
        await sword.connect(owner).setRoundIndex(roundIndex);
        await myToken.connect(owner).mint(owner.address, ethers.parseEther("100"));
        await myToken.connect(owner).approve(sword.target, ethers.parseEther("100"));

        const balanceOfBefore = await myToken.balanceOf(sword.runner.address);

        await sword.connect(owner).buyNFT(quantity, tokenId);
        
        const balanceOfAfter = await myToken.balanceOf(sword.runner.address);
        const balance = balanceOfBefore - balanceOfAfter;
        
        expect(await sword.balanceOf(owner.getAddress(), tokenId)).to.equal(quantity);      
        expect(balance).to.equal(BigInt(quantity) * price); 
    });

    it("Buy NFTs Max quantity user", async function(){
        await sword.connect(owner).setRoundIndex(2);
        await myToken.connect(owner).mint(owner.address, ethers.parseEther("100"));
        await myToken.connect(owner).approve(sword.target, ethers.parseEther("100"));
        await expect(sword.connect(owner).buyNFT(10, 0)).to.be.revertedWith("Max quantity user");
    });

    //-----------------------------------------------------------------
    /////////////////////////UPDATE ROUND/////////////////////////////////

    it("Test Update round", async function(){
        const timePresent = Math.floor(Date.now() / 1000);
        const _startTime = timePresent;
        const _endTime = timePresent + 1209600;
        const _maxNFTsPerUser = 40;
        const _totalNFTsInRound = 4000;
        const _newPrices = [3000000000000000, 6000000000000000];
        const _newTokenAddress = "0x0000000000000000000000000000000000000000";
        const _newTotalSupply = 0;

        await sword.updateRound(1,_startTime, _endTime, _maxNFTsPerUser, _totalNFTsInRound, _newPrices, _newTokenAddress, _newTotalSupply);
        
        const roundIndex = await sword.currentRound();
        const round = await sword.getRound(1);

        expect(round.startTime).to.equal(_startTime);
        expect(round.endTime).to.equal(_endTime);
        expect(round.maxNFTsPerUser).to.equal(_maxNFTsPerUser);
        expect(round.totalNFTsInRound).to.equal(_totalNFTsInRound);
        expect(round.prices).to.deep.equal(_newPrices);
        expect(round.tokenAddress).to.equal(_newTokenAddress);
    });
    
    //-----------------------------------------------------------------
    /////////////////////////TEST WITHDRAW/////////////////////////////////

    it("Test WithdRaw", async function(){
        const etherContractBefore = await sword.getEtherContractBalance(sword.target);
        const etherOwnerBefore = await sword.getEtherContractBalance(owner.address);
        const tokenContractBefore = await myToken.balanceOf(sword.target);
        const tokenOwnerBefore = await myToken.balanceOf(owner.address);

        const tx1 = await sword.connect(owner).withdRaw(ethers.ZeroAddress);
        const tx2 = await sword.connect(owner).withdRaw(tokenAddr);
        const res1 = await tx1.wait();
        const res2 = await tx2.wait();

        const totalGas1 = res1.gasPrice * res1.gasUsed;
        const totalGas2 = res2.gasPrice * res2.gasUsed;
         
        const etherContractAfter = await sword.getEtherContractBalance(sword.target);
        const etherOwnerAfter = await sword.getEtherContractBalance(owner.address);
        const tokenContractAfter = await myToken.balanceOf(sword.target);
        const tokenOwnerAfter = await myToken.balanceOf(owner.address);
       
        expect(etherOwnerAfter - etherOwnerBefore).to.equal(etherContractBefore - (totalGas1 + totalGas2));
        expect(tokenOwnerAfter - tokenOwnerBefore).to.equal(tokenContractBefore);
        //expect(etherContractAfter).to.equal(etherContractBefore + etherOwnerBefore + totalGas1 + totalGas2);
    });
});