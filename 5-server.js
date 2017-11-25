const http = require('http');
const Web3 = require('web3');
const Plant = require('@plant/plant');
const fs = require('fs');
const path = require('path');

const {run, forever, indent} = require('./lib/utils.js');

const toEther = (value) => Web3.utils.fromWei(String(value), 'ether');
const toWei = (value) => Web3.utils.toWei(String(value), 'ether');

const originHandler = require('./lib/origin-handler.js');
const indexPage = fs.readFileSync(path.join(__dirname, 'ui/index.html'), 'utf8');

async function main() {
    const contract = require('./contract.json');

    const web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
    );

    const from = await web3.eth.getCoinbase();

    const piggy = new web3.eth.Contract(contract.interface, contract.address, {
        // Set default from address
        from,
        // Set default gas amount
        gas: 5000000,
    });

    const limit = await piggy.methods.limit().call();

    const router = new Plant.Router();

    const getState = async () => {
        const contract = await web3.eth.getBalance(piggy.options.address);
        const balance = await web3.eth.getBalance(from);

        return {
            balance: toEther(balance),
            contract: {
                balance: toEther(contract),
                limit: toEther(limit),
            },
        };
    };

    router.get('/state', async ({res}) => {
        const state = await getState();
        res.json(state);
    });

    router.post('/deposit', async ({res}) => {
        // Get Contract.counter variable value
        await piggy.methods.deposit().send({
            from,
            value: toWei(1),
        });

        const state = await getState();
        res.json(state);
    });

    router.post('/withdraw', async ({res}) => {
        const canWithdraw = await piggy.methods.canWithdraw().call();

        if (! canWithdraw) {
            res.status(400)
            .json({
                error: 'Limited funds',
            });
            return;
        }

        // Get Contract.counter variable value
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
    server.use(router);

    http.createServer(
        server.handler()
    )
    .listen(8080, () => {
        console.log(indent(`
            Server is started at port localhost:8080.

            GET /state - returns current balance of contract and account.
            POST /deposit - calls deposit() and sends 1 ether from account to contract.
            POST /withdraw - calls withdraw().
        `));
    });

    // Prevent from termination
    await forever;
}

run(main);
