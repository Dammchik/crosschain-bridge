// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./MyToken.sol";

contract Bridge is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    MyToken public immutable token;

    // Для защиты от повторного выполнения
    mapping(uint256 => bool) public processedDeposits;

    event Deposit(
        uint256 depositId,
        address from,
        uint256 amount,
        address targetAddress
    );

    event Withdraw(
        uint256 depositId,
        address to,
        uint256 amount
    );

    constructor(address tokenAddress) {
        token = MyToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /// @notice Пользователь "депозитит" токены для перевода в другую сеть
    function deposit(
        uint256 depositId,
        uint256 amount,
        address targetAddress
    ) external {
        require(!processedDeposits[depositId], "Deposit already processed");
        require(amount > 0, "Amount = 0");

        processedDeposits[depositId] = true;

        token.burn(msg.sender, amount);

        emit Deposit(depositId, msg.sender, amount, targetAddress);
    }

    /// @notice Оператор выполняет выпуск токенов в целевой сети
    function mint(
        uint256 depositId,
        address to,
        uint256 amount
    ) external onlyRole(OPERATOR_ROLE) {
        require(!processedDeposits[depositId], "Deposit already processed");
        require(amount > 0, "Amount = 0");

        processedDeposits[depositId] = true;

        token.mint(to, amount);

        emit Withdraw(depositId, to, amount);
    }
}