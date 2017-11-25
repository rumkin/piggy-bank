const TestRpc = require('ethereumjs-testrpc');
const Web3 = require('web3');

module.exports = function({accounts = []} = {}) {
    return new Web3(
      TestRpc.provider({
        accounts,
      })
    );
};
