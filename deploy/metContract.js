const { Web3 } = require("web3");
require("dotenv").config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const metContract = async (proxyca, address, privateKey) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const abi = require("../contract/ProxyAbi.json");
    const balance = Number(await web3.eth.getBalance(publicKey));
    const proxyContract = new web3.eth.Contract(abi, proxyca);

    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = Math.round(gasPrice * 1.5);
    const transaction = proxyContract.methods.metContract(address);
    let gas = await transaction.estimateGas({
      from: publicKey,
      gasPrice,
    });
    gas = Math.round(gas * 1.05);
    if (balance > gas * gasPrice) {
      const tx = await transaction.send({
        from: publicKey,
        gas,
        gasPrice,
        maxPriorityFeePerGas: web3.utils.toWei("33", "gwei"),
      });
      console.log(tx.transactionHash);
      return {
        status: 1,
        data: tx.transactionHash,
      };
    } else {
      console.log("Wallet balance is not sufficient");
      return {
        status: 0,
        data: "Wallet balance is not sufficient",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      data: "MetContract Error",
    };
  }
};

module.exports = metContract;
