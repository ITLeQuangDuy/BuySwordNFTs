// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractERC1155 is ERC1155, Ownable {
    
    address public admin;

    constructor() ERC1155("") {}

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function setAdmin(address _admin) external onlyOwner {
        admin = _admin;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) external onlyAdmin {
        _mint(account, id, amount, data);
    }
}
