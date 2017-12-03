const http = require('http');
const Web3 = require('web3');
const Plant = require('@plant/plant');
const fs = require('fs');
const path = require('path');

const {run, forever, indent} = require('./lib/utils.js');

const toEther = (value) => Web3.utils.fromWei(String(value), 'ether');
const toWei = (value) => Web3.utils.toWei(String(value), 'ether');
// BigNumber
const BigNum = Web3.utils.BN;

const originHandler = require('./lib/origin-handler.js');
const errorHandler = require('./lib/error-handler.js');
const indexPage = fs.readFileSync(
    path.join(__dirname, 'ui/index.html'), 'utf8'
);

async function main() {
    const contract = require('./contract.json');

    // Initialize web3 instance with local network
    const web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
    );

    // Get current account address
    const from = await web3.eth.getCoinbase();

    // initialize contract
    const piggy = new web3.eth.Contract(contract.interface, contract.address, {
        // Set default from address
        from,
        // Set default gas amount
        gas: 5000000,
    });

    const getState = async () => {
        // Get contract balance
        const contractBalance = await web3.eth.getBalance(contract.address);
        // Get current user balance
        const balance = await web3.eth.getBalance(from);
        // Get PiggyBank.limit variable
        const limit = await piggy.methods.limit().call();

        return {
            balance: toEther(balance),
            contract: {
                address: contract.address,
                balance: toEther(contractBalance),
                limit: toEther(limit),
            },
        };
    };


    const router = new Plant.Router();

    // Route to get state of balance and contract.
    router.get('/state', async ({res}) => {
        const state = await getState();
        res.json(state);
    });

    // Route to deposit ethers
    router.post('/deposit', async ({req, res}) => {
        let value;
        if ('value' in req.query) {
            value = parseInt(req.query.value);

            if (value <= 0) {
                res.status(400);
                res.json({
                    error: 'Value should be greater then 0',
                });
                return;
            }
        }
        else {
            value = 1;
        }

        const balance = await web3.eth.getBalance(from);

        // Convert balance and value to BigNumbers to allow comparision in weis.
        const bnValue = web3.utils.toWei(new BigNum(value), 'ether');
        const bnBalance = new BigNum(balance);

        // Check if we have enough ethers on a balance.
        if (bnValue.gt(bnBalance)) {
            res.status(400);
            res.json({
                error: `You have no ${value} ethers on your balance`,
            });
            return;
        }

        // Send value to contract with payable method deposit
        // with method PiggyBank.deposit
        await piggy.methods.deposit().send({
            from,
            value: bnValue,
        });

        const state = await getState();
        res.json(state);
    });

    // Route to withdraw
    router.post('/withdraw', async ({res}) => {
        // Call canWithdraw method to determine is contract's `limit` reached.
        const canWithdraw = await piggy.methods.canWithdraw().call();

        if (! canWithdraw) {
            res.status(400)
            .json({
                error: 'Limited funds',
            });
            return;
        }

        // Withdraw ethers from contact to users' contract
        // with method PiggyBank.withdraw
        await piggy.methods.withdraw().send();

        const state = await getState();
        res.json(state);
    });

    router.get('/', async ({res}) => {
        res.html(indexPage);
    });

    // Create and run server

    const server = new Plant();
    server.use(originHandler);
    server.use(errorHandler);
    server.use(router);

    http.createServer(
        server.handler()
    )
    .listen(8080, () => {
        console.log(indent(`
            Server is started at port http://localhost:8080.

            GET /state - returns current balance of contract and account.
            POST /deposit - calls deposit() and sends 1 ether from account to contract.
            POST /withdraw - calls withdraw().
        `));
    });

    // Prevent from termination
    await forever;
}

run(main);
