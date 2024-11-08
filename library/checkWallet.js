const { Web3 } = require("web3");

require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

async function checkWallet(wallets) {
  return wallets.map(
    (wallet) => web3.eth.accounts.privateKeyToAccount(wallet).address
  );
}

module.exports = checkWallet;
