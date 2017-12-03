const {run} = require('./lib/utils.js');
const Web3 = require('web3');

async function main() {
    // Create web3 instance and connect to local net
    const web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
    );

    // Get current account address
    const coinbase = await web3.eth.getCoinbase();
    console.log('Address: %s', coinbase);

    // Get current account balance
    const balance = await web3.eth.getBalance(coinbase);
    // Convert from wei to ether
    const ethers = web3.utils.fromWei(balance, 'ether');
    console.log('Balance: %s eth', ethers);
}

run(main);
