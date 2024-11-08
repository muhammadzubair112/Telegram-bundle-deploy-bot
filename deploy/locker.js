const { Web3 } = require("web3");
require("dotenv").config();
const uniswapV2FactoryABI = require("../contract/uniswapV2FactoryABI.json");
const uniswapV2PairABI = require("../contract/uniswapV2pairABI.json");
const uniswapV2LockTestABI = require("../contract/uniswapV2LockTestnet.json");
const uniswapV2LockMainABI = require("../contract/uniswapV2LockMainnet.json");
const getCurrentBlockTimestamp = require("../library/getBlockTime");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
let WETH;

if (process.env.network == "mainnet") {
  WETH = process.env.WETHMainnet;
} else {
  WETH = process.env.WETHTestnet;
}

const locker = async (address, privateKey) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    let balance = Number(await web3.eth.getBalance(publicKey));

    const factory = new web3.eth.Contract(uniswapV2FactoryABI, factoryAddress);
    const pairAddress = await factory.methods.getPair(address, WETH).call();
    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
      const pair = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
      const lpBalance = await pair.methods.balanceOf(publicKey).call();
      if (lpBalance > 0) {
        let gasPrice = await web3.eth.getGasPrice();
        gasPrice = Math.round(gasPrice * 1.5);
        let transaction;
        if (process.env.network == "mainnet") {
          transaction = pair.methods.approve(
            process.env.lockAddressMainnet,
            `${lpBalance}`
          );
        } else {
          transaction = pair.methods.approve(
            process.env.lockAddressTestnet,
            `${lpBalance}`
          );
        }

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
            maxPriorityFeePerGas: web3.utils.toWei("1", "gwei"),
          });
          console.log(tx.transactionHash);
          let lockContract;
          if (process.env.network == "mainnet") {
            lockContract = new web3.eth.Contract(
              uniswapV2LockMainABI,
              process.env.lockAddressMainnet
            );
          } else {
            lockContract = new web3.eth.Contract(
              uniswapV2LockTestABI,
              process.env.lockAddressTestnet
            );
          }
          let blockTime = await getCurrentBlockTimestamp();
          let lockTime = blockTime + process.env.lockTime * 24 * 3600;
          let lockTx;
          if (process.env.network == "mainnet") {
            lockTx = await lockContract.methods.lockLPToken(
              pairAddress,
              `${lpBalance}`,
              lockTime,
              "0x0000000000000000000000000000000000000000",
              true,
              publicKey
            );

            gas = await lockTx.estimateGas({
              from: publicKey,
              gasPrice,
              value: web3.utils.toWei(`0.1`, "ether"),
            });

            balance = Number(await web3.eth.getBalance(publicKey));
            gas = Math.round(gas * 1.01);

            if (
              balance >
              gas * gasPrice + Number(web3.utils.toWei(`0.1`, "ether"))
            ) {
              const lockTxResult = await lockTx.send({
                from: publicKey,
                gas,
                gasPrice,
                value: web3.utils.toWei(`0.1`, "ether"),
                maxPriorityFeePerGas: web3.utils.toWei("1", "gwei"),
              });

              console.log(lockTxResult.transactionHash);
              return {
                status: 1,
                data: [tx.transactionHash, lockTxResult.transactionHash],
              };
            } else {
              return {
                status: 0,
                data: "Wallet balance is not sufficient",
              };
            }
          } else {
            lockTx = await lockContract.methods.lockLPToken(
              pairAddress,
              `${lpBalance}`,
              lockTime,
              "0x0000000000000000000000000000000000000000",
              true,
              publicKey,
              238
            );
            gas = await lockTx.estimateGas({
              from: publicKey,
              gasPrice,
              value: web3.utils.toWei(`0.01`, "ether"),
            });

            balance = Number(await web3.eth.getBalance(publicKey));
            gas = Math.round(gas * 1.01);

            if (
              balance >
              gas * gasPrice + Number(web3.utils.toWei(`0.01`, "ether"))
            ) {
              const lockTxResult = await lockTx.send({
                from: publicKey,
                gas,
                gasPrice,
                value: web3.utils.toWei(`0.01`, "ether"),
                maxPriorityFeePerGas: web3.utils.toWei("1", "gwei"),
              });

              console.log(lockTxResult.transactionHash);
              return {
                status: 1,
                data: [tx.transactionHash, lockTxResult.transactionHash],
              };
            } else {
              return {
                status: 0,
                data: "Wallet balance is not sufficient",
              };
            }
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
          data: "LP balance is zero",
        };
      }
    } else {
      return {
        status: 0,
        data: "Still not open trading",
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      data: "Lock Error",
    };
  }
};

module.exports = locker;
