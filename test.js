const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');
const { ethers } = require('ethers');
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('YOUR_INFURA_RPC_URL');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, wallet, 'https://relay.flashbots.net');

    const transactions = [
        {
            to: 'ERC20_CONTRACT_ADDRESS',
            data: 'DEPLOY_ERC20_BYTECODE',
            gasLimit: 1000000
        },
        {
            to: 'UNISWAP_ROUTER_ADDRESS',
            data: 'ADD_LIQUIDITY_DATA',
            gasLimit: 500000
        },
        {
            to: 'UNISWAP_ROUTER_ADDRESS',
            data: 'SWAP_TOKENS_DATA',
            gasLimit: 500000
        }
    ];

    const signedTransactions = await Promise.all(transactions.map(tx => wallet.signTransaction(tx)));
    const nonce = await provider.getTransactionCount(wallet.address) + index;

    const bundle = signedTransactions.map((signedTx, index) => ({
        signedTransaction: signedTx,
        hash: ethers.utils.keccak256(signedTx),
        nonce: nonce
    }));

    const blockNumber = await provider.getBlockNumber();
    const targetBlockNumber = blockNumber + 1;

    const response = await flashbotsProvider.sendBundle(bundle, targetBlockNumber);

    if ('error' in response) {
        console.error(`Error: ${response.error.message}`);
    } else {
        console.log(`Bundle sent successfully: ${response.bundleHash}`);
    }
}

main();
