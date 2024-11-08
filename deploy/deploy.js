const compile = require("./compile");
const { Web3 } = require("web3");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const deploy = async (
  name,
  symbol,
  letterName,
  buyTax,
  sellTax,
  privateKey,
  legit_rug_state,
  proxyca
) => {
  try {
    web3.eth.accounts.wallet.add(privateKey);
    const publicKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    await compile(name, symbol, letterName, buyTax, sellTax, legit_rug_state);
    console.log(
      name,
      symbol,
      letterName,
      buyTax,
      sellTax,
      legit_rug_state,
      proxyca
    );
    let bytecode;
    let myContract;
    if (legit_rug_state) {
      const bytecodePath = path.join(
        __dirname,
        "..",
        "contract/RugBytecode.bin"
      );
      bytecode = fs.readFileSync(bytecodePath, "utf8");
      const abi = require("../contract/RugAbi.json");
      myContract = new web3.eth.Contract(abi);
    } else {
      const bytecodePath = path.join(
        __dirname,
        "..",
        "contract/LegitBytecode.bin"
      );
      bytecode = fs.readFileSync(bytecodePath, "utf8");
      const abi = require("../contract/LegitAbi.json");
      myContract = new web3.eth.Contract(abi);
    }

    // console.log(abi, "abi")
    let deployedContract;
    if (legit_rug_state) {
      deployedContract = myContract.deploy({
        data: "0x" + bytecode,
        arguments: [proxyca],
      });
    } else {
      deployedContract = myContract.deploy({
        data: "0x" + bytecode,
      });
    }

    const balance = Number(await web3.eth.getBalance(publicKey));
    console.log(balance, publicKey, "bapu");
    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = Math.round(gasPrice);
    // optionally, estimate the gas that will be used for development and log it
    let gas = await deployedContract.estimateGas({
      from: publicKey,
    });

    gas = Math.round(gas * 1.01);
    console.log("estimated gas:", gas * gasPrice);
    if (balance > gas * gasPrice) {
      // Deploy the contract to the Ganache network
      const tx = await deployedContract.send({
        from: publicKey,
        gas,
        gasPrice,
        maxPriorityFeePerGas: web3.utils.toWei("3", "gwei"),
      });
      console.log("Contract deployed at address: " + tx.options.address);
      if (legit_rug_state == false) {
        // Write the Contract address to a new file
        const deployedAddressPath = path.join(
          __dirname,
          "..",
          "contract/AddrLegit.txt"
        );
        fs.appendFileSync(deployedAddressPath, `${tx.options.address}\n`);
      } else {
        // Write the Contract address to a new file
        const deployedAddressPath = path.join(
          __dirname,
          "..",
          "contract/AddrRug.txt"
        );
        fs.appendFileSync(deployedAddressPath, `${tx.options.address}\n`);
      }

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
    console.log(err);
    return {
      status: 0,
      data: "Deploy Error",
    };
  }
};

module.exports = deploy;
