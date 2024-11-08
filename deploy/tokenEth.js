const { Web3 } = require("web3");
require("dotenv").config();

// const getRandomInt = require('../library/random');
const delay = require("../library/delay");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const tokenEth = async (address, privateKey, legit_rug_state) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    let abi;
    if (legit_rug_state) {
      abi = require("../contract/RugAbi.json");
    } else {
      abi = require("../contract/LegitAbi.json");
    }
    const balance = Number(await web3.eth.getBalance(publicKey));
    const tokenContract = new web3.eth.Contract(abi, address);
    const tokenBalance = await tokenContract.methods
      .balanceOf(publicKey)
      .call();
    console.log("token balance:", tokenBalance);
    if (tokenBalance > 0) {
      console.log(Date.now() / 1000);
      let gasPrice = await web3.eth.getGasPrice();
      gasPrice = Math.round(gasPrice * 1.5);
      console.log(gasPrice, "gasPrice");
      const transaction = tokenContract.methods.transfer(
        address,
        `${tokenBalance}`
      );
      let gas = await transaction.estimateGas({
        from: publicKey,
        gasPrice,
      });
      gas = Math.round(gas * 1.05);
      console.log(gas, "gas");
      if (balance > gas * gasPrice) {
        const tx = await transaction.send({
          from: publicKey,
          gas,
          gasPrice,
          maxPriorityFeePerGas: web3.utils.toWei("3", "gwei"),
        });
        console.log(tx.transactionHash);
        console.log(Date.now() / 1000);
        const delayT = Number(process.env.auto_manualDelayMain);
        await delay(delayT * 1000);
        let amount = Number(
          web3.utils.toWei(`${process.env.liquidityEthAmount}`, "ether")
        );
        gas = await web3.eth.estimateGas({
          from: publicKey,
          to: address,
          amount: amount,
        });

        gas = Math.round(gas * 1.05);

        if (balance > amount + gas * gasPrice + 1000) {
          const txEth = {
            from: publicKey,
            to: address,
            value: amount,
            gas,
            // gasPrice,
            maxPriorityFeePerGas: web3.utils.toWei("3", "gwei"),
          };
          const createTransaction = await web3.eth.accounts.signTransaction(
            txEth,
            privateKey
          );
          const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );

          console.log(
            `SendETH successful with hash: ${createReceipt.transactionHash}`
          );
          console.log(Date.now() / 1000);
          return {
            status: 1,
            data: [tx.transactionHash, createReceipt.transactionHash],
          };
        } else {
          return {
            status: 0,
            data: "Wallet balance is not sufficient",
          };
        }
      } else {
        return {
          status: 0,
          data: "Wallet balance is not sufficient",
        };
      }
    } else {
      return {
        status: 0,
        data: "Token balance is zero",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      data: "Token/Eth Error",
    };
  }
};

module.exports = tokenEth;
