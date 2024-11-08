const fs = require('fs');
const solc = require('solc');
const path = require('path');
const getProxyCa = require('../contract/caProxy');

async function proxyCompile() {
    try {
        // Read the Solidity source code from the file system
        const sourceCode = getProxyCa();
        const contractName = "REKTV4";
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
        const bytecodePath = path.join(__dirname, '..', 'contract/ProxyBytecode.bin');
        fs.writeFileSync(bytecodePath, bytecode);

        // // Log the compiled contract code to the console
        // console.log('Contract Bytecode:\n', bytecode);

        // Get the ABI from the compiled contract
        const abi = compiledCode.contracts['fileName'][contractName].abi;

        // Write the Contract ABI to a new file
        const abiPath = path.join(__dirname, '..', 'contract/ProxyAbi.json');
        fs.writeFileSync(abiPath, JSON.stringify(abi, null, '\t'));

        // // Log the Contract ABI to the console
        // console.log('Contract ABI:\n', abi);
    } catch (err) {
        console.log(err);
    }

}

module.exports = proxyCompile;