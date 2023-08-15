// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SwordNFTs is ERC1155, Ownable {
    
    struct Round {
        uint256 startTime;
        uint256 endTime;
        uint256 maxNFTsPerUser;
        uint256 totalNFTsInRound;
        //uint256 maxNFTsInRound;
        uint256[] prices;
        address tokenAddress;
    }

    mapping(uint256 => Round) public rounds;
    uint256 public currentRound;
    //uint256 public roundIndex;
    uint256 public timeNextRound = 604800;

    constructor() ERC1155("") {}

    function addRound(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxNFTsPerUser,
        uint256 _totalNFTsInRound,
        //uint256 _maxNFTsInRound,
        uint256[] memory _prices,
        address _tokenAddress
    ) external onlyOwner{
        currentRound++;
        Round storage round = rounds[currentRound];

        if (currentRound > 1) {
            Round storage prevRound = rounds[currentRound - 1];
            require(block.timestamp >= prevRound.endTime + timeNextRound, "Start round invalid");
        }

        round.startTime = _startTime;
        round.endTime = _endTime;
        round.maxNFTsPerUser = _maxNFTsPerUser;
        round.totalNFTsInRound = _totalNFTsInRound;
        round.prices = _prices;
        round.tokenAddress = _tokenAddress;
    }

    function updateRound(
        uint256 roundIndex,
        uint256 newStartTime,
        uint256 newEndTime,
        uint256 newMaxNFTsPerUser,
        uint256 newTotalNFTsInRound,
        //uint256 newMaxNFTsInRound,
        uint256[] memory newPrice,
        address newTokenAddress
    ) external onlyOwner{
        Round storage round = rounds[roundIndex];

        round.startTime = newStartTime;
        round.endTime = newEndTime;
        round.maxNFTsPerUser = newMaxNFTsPerUser;
        round.totalNFTsInRound = newTotalNFTsInRound;
        round.prices = newPrice;
        round.tokenAddress = newTokenAddress;
    }

    function getRound(uint256 roundIndex) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 maxNFTsPerUser,
        uint256 totalNFTsInRound,
        uint256[] memory prices,
        address tokenAddress
    ) {
        require(roundIndex > 0 && roundIndex <= currentRound, "Round does not exist");

        Round memory round = rounds[roundIndex];
        return (
            round.startTime,
            round.endTime,
            round.maxNFTsPerUser,
            round.totalNFTsInRound,
            round.prices,
            round.tokenAddress
        );
    }

    function buyNFT(uint256 amount, uint256 tokenId) external payable {
        Round storage round = rounds[currentRound];

        require(block.timestamp >= round.startTime,"Not time open sale");
        require(block.timestamp <= round.endTime, "Pass time on sale");
        require(tokenId < round.prices.length, "Invalid tokenId");

        if (round.tokenAddress == address(0)) {
            require(msg.value == round.prices[tokenId] * amount, "Not enough native coin");
            _mint(msg.sender, tokenId, amount, "");
        } else {
            require(msg.value == 0, "Dont need token ID");
            IERC20(round.tokenAddress).transfer(msg.sender, amount * round.prices[tokenId]);
            _mint(msg.sender, tokenId, amount,"");
        }
    }

    function setTimeOnSaleNextRound(uint256 _time) external onlyOwner{
        timeNextRound = _time;
    }
}
