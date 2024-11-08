const { Web3 } = require("web3");
require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const tokenEth = async (privateKey) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const balance = Number(await web3.eth.getBalance(publicKey));

    console.log("balance:", balance);

    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = Math.round(gasPrice * 1);
    let gas = await web3.eth.estimateGas({
      from: publicKey,
      to: process.env.destAddress,
      amount: web3.utils.toWei(`${balance}`, "ether"),
    });
    gas = Math.round(gas * 1.01);
    // gas = Math.round(gas * 1.2)
    const sendValue = balance - (gas * gasPrice + 1000);

    if (sendValue > 0) {
      if (web3.utils.isAddress(process.env.destAddress) == true) {
        const tx = {
          from: publicKey,
          to: process.env.destAddress,
          value: sendValue,
          gas,
          gasPrice,
        };
        // console.log(gas);
        const createTransaction = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );

        // Deploy transaction
        const createReceipt = await web3.eth.sendSignedTransaction(
          createTransaction.rawTransaction
        );

        console.log(
          `Transaction successful with hash: ${createReceipt.transactionHash}`
        );
        return {
          status: 1,
          data: createReceipt.transactionHash,
        };
      } else {
        return {
          status: 0,
          data: "ToAddress is not correct!",
        };
      }
    } else {
      return {
        status: 0,
        data: "Send value is not sufficient",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      data: "ETH Transfer Error",
    };
  }
};

module.exports = tokenEth;
