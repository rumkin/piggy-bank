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

    function PiggyBank(uint _limit) public {
        require(_limit > 0);

        owner = msg.sender;
        limit = _limit * decimals;
    }

    function deposit() public payable {}

    function canWithdraw() public constant returns (bool){
        return this.balance >= limit;
    }

    function withdraw() public isOwner {
        require(canWithdraw());

        msg.sender.transfer(this.balance);
    }

    function getLimit() public constant returns(uint) {
        return limit;
    }
}
