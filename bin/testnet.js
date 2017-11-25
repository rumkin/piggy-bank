const TestRpc = require('ethereumjs-testrpc');

const account = require('../account.json');

const server = TestRpc.server({
    accounts: [account],
    locked: true,
});

server.listen(8545, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    else {
        console.log('Ethereum testnet is running');
    }
});
