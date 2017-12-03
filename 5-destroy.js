const Web3 = require('web3');

const {run} = require('./lib/utils.js');

async function main() {
    const contract = require('./contract.json');

    // Initialize web3 instance with local network
    const web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
    );

    // Get current account address
    const coinbase = await web3.eth.getCoinbase();

    // Initialize contract
    const piggy = new web3.eth.Contract(contract.interface, contract.address, {
        // Set default from address
        from: coinbase,
        // Set default gas amount
        gas: 5000000,
    });

    await piggy.methods.kill().send();
};

run(main);
