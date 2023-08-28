// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ContractERC1155.sol";

contract ContractAdmin {

    ContractERC1155 public nftContract;

    constructor(address addressContractMint){
        nftContract = ContractERC1155(addressContractMint);
    }

    function mint(uint256 tokenId, uint256 amount) external {
        address userAddress = msg.sender;
        nftContract.mint(userAddress, tokenId, amount, "");
    }
}
