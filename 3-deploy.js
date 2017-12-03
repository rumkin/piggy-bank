const Web3 = require('web3');
const fs = require('fs');

const {run} = require('./lib/utils.js');

const code = require('./code.json');

async function main() {
    // Create web3 instance and connect to local net
    const web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
    );

    const coinbase = await web3.eth.getCoinbase();

    const PiggyBank = new web3.eth.Contract(code.interface, {
        from: coinbase,
        gas: 5000000,
    });

    const limit = process.argv[2] || 2;

    // Deploy contract in the testnet
    const contract = await PiggyBank.deploy({
        // Conract body
        data: code.bytecode,
        // Constructor arguments
        arguments: [limit],
    })
    .send();

    // Remember contract's address and save with interface
    fs.writeFileSync('contract.json', JSON.stringify({
        address: contract.options.address,
        interface: code.interface,
    }, null, 4));
}

run(main);
