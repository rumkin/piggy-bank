const inquirer = require('inquirer');

module.exports = function () {
    const prompt = inquirer.createPromptModule();

    return prompt([
        {
            name: 'password',
            message: 'Enter password',
            type: 'password',
        },
        {
            name: 'balance',
            message: 'Enter balance (ether)',
            type: 'input',
            filter(value) {
                return parseInt(value);
            },
            validate(value) {
                return value > 0;
            },
        },
    ]);
};
