const Web3 = require('web3');
const crypto = require('crypto');

module.exports = function createAccount(password, balance) {
    return {
        secretKey: secretKeyFromPassword(password),
        balance: Web3.utils.toWei(String(balance), 'ether'),
    };
};

function secretKeyFromPassword(password) {
    const hash = crypto.createHash('sha256')
    .update(password)
    .digest('hex');

    return '0x' + hash;
}
