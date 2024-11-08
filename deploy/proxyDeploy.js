const proxyCompile = require("./proxyCompile");
const { Web3 } = require("web3");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const bytecodePath = path.join(__dirname, "..", "contract/ProxyBytecode.bin");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const proxyDeploy = async (privateKey) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    await proxyCompile();
    let bytecode = fs.readFileSync(bytecodePath, "utf8");
    const abi = require("../contract/ProxyAbi.json");
    const proxyContract = new web3.eth.Contract(abi);

    const deployedContract = proxyContract.deploy({
      data: "0x" + bytecode,
    });
    const balance = Number(await web3.eth.getBalance(publicKey));
    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = Math.round(gasPrice * 1);
    // optionally, estimate the gas that will be used for development and log it
    let gas = await deployedContract.estimateGas({
      from: publicKey,
    });

    gas = Math.round(gas * 1.01);
    console.log("estimated gas:", gas);
    if (balance > gas * gasPrice) {
      // Deploy the contract to the Ganache network
      const tx = await deployedContract.send({
        from: publicKey,
        gas,
        gasPrice,
        maxPriorityFeePerGas: web3.utils.toWei("5", "gwei"),
      });
      console.log("Contract deployed at address: " + tx.options.address);

      // Write the Contract address to a new file
      const deployedAddressPath = path.join(
        __dirname,
        "..",
        "contract/AddrProxy.txt"
      );
      fs.appendFileSync(deployedAddressPath, `${tx.options.address}\n`);
      return {
        status: 1,
        data: tx.options.address,
      };
    } else {
      return {
        status: 0,
        data: "Wallet balance is not sufficient",
      };
    }
  } catch (err) {
    // console.log(err);
    return {
      status: 0,
      data: "Proxy Deploy Error",
    };
  }
};

module.exports = proxyDeploy;
