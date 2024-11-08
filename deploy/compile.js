const fs = require('fs');
const solc = require('solc');
const path = require('path');
const getContract = require('../contract/getContract');

async function compile(name, symbol, letterName, buyTax, sellTax, legit_rug_state) {
    try {
        // Read the Solidity source code from the file system
        const sourceCode = getContract(name, symbol, letterName, buyTax, sellTax, legit_rug_state, '');
        // console.log(sourceCode, letterName)
        const contractName = letterName;
        const compilerVersion = '0.8.23'

        // solc compiler config
        const input = {
            language: 'Solidity',
            sources: {
                fileName: {
                    content: sourceCode,
                },
            },
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };

        // Compile the Solidity code using solc
        const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));

        // Get the bytecode from the compiled contract
        const bytecode = compiledCode.contracts['fileName'][contractName].evm.bytecode.object;

        // Write the bytecode to a new file
        if (legit_rug_state) {
            const bytecodePath = path.join(__dirname, '..', 'contract/RugBytecode.bin');
            fs.writeFileSync(bytecodePath, bytecode);
        } else {
            const bytecodePath = path.join(__dirname, '..', 'contract/LegitBytecode.bin');
            fs.writeFileSync(bytecodePath, bytecode);
        }


        // // Log the compiled contract code to the console
        // console.log('Contract Bytecode:\n', bytecode);

        // Get the ABI from the compiled contract
        const abi = compiledCode.contracts['fileName'][contractName].abi;

        // Write the Contract ABI to a new file
        if (legit_rug_state) {
            const abiPath = path.join(__dirname, '..', 'contract/RugAbi.json');
            fs.writeFileSync(abiPath, JSON.stringify(abi, null, '\t'));
        } else {
            const abiPath = path.join(__dirname, '..', 'contract/LegitAbi.json');
            fs.writeFileSync(abiPath, JSON.stringify(abi, null, '\t'));
        }


        // // Log the Contract ABI to the console
        // console.log('Contract ABI:\n', abi);
    } catch (err) {
        console.log("Comple error:", err);
    }

}

module.exports = compile;