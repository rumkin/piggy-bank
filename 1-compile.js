const fs = require('fs');
const solc = require('solc');

const {run} = require('./lib/utils');

async function main() {
    console.log('Read contract source');
    const source = fs.readFileSync('./contract.sol', 'utf-8');

    console.log('Compile contract code');
    const result = solc.compile(source);

    // Extract bytecode and program interface from compiled data
    const tickets = result.contracts[':PiggyBank'];

    const contract = {
        interface: JSON.parse(tickets.interface),
        bytecode: tickets.bytecode,
    };

    console.log('Write "code.json"');
    fs.writeFileSync('./code.json', JSON.stringify(contract, null, 4));

    console.log('Complete');
}

run(main);
