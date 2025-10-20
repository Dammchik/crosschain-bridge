// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, AccessControl, Ownable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @param name Имя токена
    /// @param symbol Символ токена
    /// @param initialSupply Начальная эмиссия, попадает на аккаунт деплоя (в единицах токена, без деления на decimals)
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);

        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(to != address(0), "mint: to = zero");
        require(amount > 0, "mint: amount = 0");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        require(from != address(0), "burn: from = zero");
        require(amount > 0, "burn: amount = 0");
        _burn(from, amount);
    }

    function grantMinter(address account) external onlyOwner {
        grantRole(MINTER_ROLE, account);
    }

    function revokeMinter(address account) external onlyOwner {
        revokeRole(MINTER_ROLE, account);
    }

    function grantBurner(address account) external onlyOwner {
        grantRole(BURNER_ROLE, account);
    }

    function revokeBurner(address account) external onlyOwner {
        revokeRole(BURNER_ROLE, account);
    }

    function grantMinterAndBurner(address account) external onlyOwner {
        grantRole(MINTER_ROLE, account);
        grantRole(BURNER_ROLE, account);
    }

    // Для поддержки интерфейса AccessControl
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return AccessControl.supportsInterface(interfaceId);
    }
}