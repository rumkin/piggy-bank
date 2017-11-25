const should = require('should');

const Web3 = require('web3');
const TestRpc = require('ethereumjs-testrpc');

const code = require('../code.json');

describe('PiggyBank Contract', function() {
    let web3;
    let piggy;
    let coinbase;
    let accounts;

    before(async function() {
        web3 = new Web3(
            TestRpc.provider({
                accounts: [{
                    secretKey: Web3.utils.soliditySha3('x1'),
                    balance: Web3.utils.toWei(String(10), 'ether'),
                },{
                    secretKey: Web3.utils.soliditySha3('x2'),
                    balance: Web3.utils.toWei(String(10), 'ether'),
                }],
            }),
        );

        accounts = await web3.eth.getAccounts();
        coinbase = accounts[0];

        const gas = 5000000;

        const limit = 2;

        const PiggyBank = new web3.eth.Contract(code.interface, {
            from: coinbase,
            gas,
        });

        piggy = await PiggyBank.deploy({
            data: code.bytecode,
            arguments: [limit],
        })
        .send();
    });

    describe('deposit()', function () {
        it('Should increase contacts balance', async function () {
            const balance0 = await web3.eth.getBalance(piggy.options.address);

            await piggy.methods.deposit().send({
                value: web3.utils.toWei(String(1), 'ether'),
            });

            const balance1 = await web3.eth.getBalance(piggy.options.address);

            should(balance0).be.equal('0');
            should(balance1).be.equal('1000000000000000000');
        });
    });

    describe('canWithdraw()', function() {
        it('Should return `false` when balance is 0', async function() {
          const result = await piggy.methods.canWithdraw().call();

          should(result).which.equal(false);
        });

        it('Should return `true` when balance is 2 or more', async function() {
            await piggy.methods.deposit().send({
                value: web3.utils.toWei(String(2), 'ether'),
            });

            const result = await piggy.methods.canWithdraw().call();

            should(result).which.equal(true);
        });
    });

    describe('withdraw()', function () {
        it('Should revert withdrawing for not owner', async function () {
            let error = null;
            try {
                await piggy.methods.withdraw().send({
                    from: accounts[1],
                });
            }
            catch (err) {
                error = err;
            }

            should(error).not.be.equal(null);
            should(error.message).match(/rever/);
        });

        it('Should transfer all weis from balance to owner', async function() {
            const account0 = await web3.eth.getBalance(coinbase);

            await piggy.methods.withdraw().send();

            const account1 = await web3.eth.getBalance(coinbase);
            const contract1 = await web3.eth.getBalance(piggy.options.address);

            should(contract1).be.equal('0');
            should(parseInt(account1)).be.above(parseInt(account0));
        });
    });
});
