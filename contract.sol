pragma solidity ^0.4.0;

contract PiggyBank {
    // Owner address
    address public owner;
    // Minimal balance to allow withdraw
    uint public limit;
    // Internal variable to convert wei to ether
    uint decimals = (10 ** 18);

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
    // Event to notify about deposit
    event Deposit(address indexed from, uint value);

    function PiggyBank(uint _limit) public {
        require(_limit > 0);

        owner = msg.sender;
        limit = _limit * decimals;
    }

    // Payable method wich allows to send coins to a contract balance
    function deposit() public payable {
        Deposit(msg.sender, msg.value);
    }

    // Check if current balance is greate then a limit to allow withdrawing
    function canWithdraw() public constant returns (bool) {
        return owner == msg.sender && this.balance >= limit;
    }

    // Send entire balance to the contract owner
    function withdraw() public isOwner {
        require(canWithdraw());

        owner.transfer(this.balance);
    }

    // Destroy contract
    function kill() public isOwner {
        require(this.balance == 0);

        selfdestruct(owner);
    }
}
