const inquirer = require('inquirer');

module.exports = function () {
    const prompt = inquirer.createPromptModule();

    return prompt([
        {
            name: 'password',
            message: 'Enter password (or leave it blank for random)',
            type: 'password',
        },
        {
            name: 'balance',
            message: 'Enter balance (ether)',
            type: 'input',
            default: 100,
            filter(value) {
                return parseInt(value);
            },
            validate(value) {
                return value > 0;
            },
        },
    ]);
};
