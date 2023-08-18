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
        uint256[] prices;
        address tokenAddress;
        uint256 totalSupply;
    }

    mapping(address => uint256) public amountBought;
    mapping(uint256 => Round) public rounds;
    
    uint256 public currentRound;
    uint256 public roundIndex = 1;
    uint256 public timeNextRound = 604800;

    constructor() ERC1155("") {}

    function addRound(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxNFTsPerUser,
        uint256 _totalNFTsInRound,
        //uint256 _maxNFTsInRound,
        uint256[] memory _prices,
        address _tokenAddress,
        uint256 _newTotalSupply
    ) external onlyOwner{
        currentRound++;
        Round storage round = rounds[currentRound];

        round.startTime = _startTime;
        round.endTime = _endTime;
        round.maxNFTsPerUser = _maxNFTsPerUser;
        round.totalNFTsInRound = _totalNFTsInRound;
        round.prices = _prices;
        round.tokenAddress = _tokenAddress;
        round.totalSupply = _newTotalSupply;
    }

    function updateRound(
        uint256 _roundIndex,
        uint256 newStartTime,
        uint256 newEndTime,
        uint256 newMaxNFTsPerUser,
        uint256 newTotalNFTsInRound,
        uint256[] memory newPrice,
        address newTokenAddress,
        uint256 newTotalSupply
    ) external onlyOwner{
        Round storage round = rounds[_roundIndex];

        round.startTime = newStartTime;
        round.endTime = newEndTime;
        round.maxNFTsPerUser = newMaxNFTsPerUser;
        round.totalNFTsInRound = newTotalNFTsInRound;
        round.prices = newPrice;
        round.tokenAddress = newTokenAddress;
        round.totalSupply = newTotalSupply;
    }

    function getRound(uint256 _roundIndex) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 maxNFTsPerUser,
        uint256 totalNFTsInRound,
        uint256[] memory prices,
        address tokenAddress,
        uint256 totalSupply
    ) {
        require(_roundIndex > 0 && _roundIndex <= currentRound, "Round does not exist");

        Round memory round = rounds[_roundIndex];
        return (
            round.startTime,
            round.endTime,
            round.maxNFTsPerUser,
            round.totalNFTsInRound,
            round.prices,
            round.tokenAddress,
            round.totalSupply
        );
    }
    
    function setRoundIndex(uint256 _roundIndex) external onlyOwner(){
        roundIndex = _roundIndex;
    }

    function getTimeCurrent() public view returns(uint256){
        return block.timestamp;
    }

    function buyNFT(uint256 amount, uint256 tokenId) external payable {
        Round storage round = rounds[roundIndex];

        require(block.timestamp >= round.startTime,"Not time on sale");
        require(block.timestamp <= round.endTime,"Pass time on sale");
        require(tokenId < round.prices.length, "Invalid tokenId");
        require(amount + amountBought[msg.sender] <= round.maxNFTsPerUser ,"Max quantity user");
        require(round.totalSupply + amount <= round.totalNFTsInRound, "Max quantity in round");

        if (round.tokenAddress == address(0)) {
            require(msg.value == round.prices[tokenId] * amount, "Not enough native coin");
            _mint(msg.sender, tokenId, amount, "");
            amountBought[msg.sender] += amount;
            round.totalSupply += amount;
        } else {
            require(msg.value == 0, "Dont need ether");
            IERC20(round.tokenAddress).transferFrom(msg.sender, address(this), amount * round.prices[tokenId]);
            _mint(msg.sender, tokenId, amount,"");
            amountBought[msg.sender] += amount;
            round.totalSupply += amount;
        }
    }

    function setTimeOnSaleNextRound(uint256 _time) external onlyOwner{
        timeNextRound = _time;
    }

    function getEtherContractBalance(address _address) public view returns (uint256) {
        return address(_address).balance;
    }

    function withdRaw(address tokenAddr) external onlyOwner {
        if (tokenAddr == address(0)){
            uint256 totalEther = address(this).balance;
            payable(owner()).transfer(totalEther);
        }else{
            IERC20 token = IERC20(tokenAddr);
            uint256 totalToken = token.balanceOf(address(this));
            token.transfer(owner(), totalToken);
        }
    } 
}