const { Web3 } = require("web3");

require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

async function getCurrentBlockTimestamp() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    const timestamp = block.timestamp;
    console.log("Current block timestamp:", timestamp);
    return timestamp;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = getCurrentBlockTimestamp;
