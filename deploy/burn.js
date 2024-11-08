const { Web3 } = require("web3");
require("dotenv").config();
const uniswapV2FactoryABI = require("../contract/uniswapV2FactoryABI.json");
const uniswapV2PairABI = require("../contract/uniswapV2pairABI.json");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
let WETH;

if (process.env.network == "mainnet") {
  WETH = process.env.WETHMainnet;
} else {
  WETH = process.env.WETHTestnet;
}

const burn = async (address, privateKey) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const balance = Number(await web3.eth.getBalance(publicKey));

    const factory = new web3.eth.Contract(uniswapV2FactoryABI, factoryAddress);
    const pairAddress = await factory.methods.getPair(address, WETH).call();
    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
      const pair = new web3.eth.Contract(uniswapV2PairABI, pairAddress);
      const lpBalance = await pair.methods.balanceOf(publicKey).call();
      if (lpBalance > 0) {
        let gasPrice = await web3.eth.getGasPrice();
        gasPrice = Math.round(gasPrice * 1.5);
        const transaction = pair.methods.transfer(
          "0x000000000000000000000000000000000000dEaD",
          `${lpBalance}`
        );
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
            maxPriorityFeePerGas: web3.utils.toWei("3", "gwei"),
          });
          console.log(tx.transactionHash);
          return {
            status: 1,
            data: tx.transactionHash,
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
      data: "Burn Error",
    };
  }
};

module.exports = burn;
