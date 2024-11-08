const { ethers, parseEther, parseUnits } = require("ethers");
const {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
  FlashbotsTransaction,
  FlashbotsTransactionResponse,
} = require("@flashbots/ethers-provider-bundle");
const readline = require("readline");
const contractABI = require('../contract_source/contractABI.json')

const {
  code,
  key,
  univ2,
  weth,
  flashbot_relayer,
  liqEth,
  liquidityToken,
  chainId,
  walletConfigs
} = require("../deployconfig");

// const rpc = 'https://rpc.ankr.com/eth_sepolia'; 

const rpc = 'https://quaint-wispy-putty.ethereum-sepolia.quiknode.pro/e93699d68400d80a1db95a2d1016e3034af9907f'

// Setup
const gwei = "200";
const gaslimit = 3000000; // Adjusted gas limit
const maxPriorityFeePerGas = parseUnits("200", "gwei");
const liq = liqEth;
// RPC provider URL// RPC provider URL

const provider = new ethers.JsonRpcProvider(rpc); // mainnet rpc
const FLASHBOTS_ENDPOINT = flashbot_relayer;
const wallet = new ethers.Wallet(key, provider);
const abi = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function openTrading() external",
  "function receiveTokens(uint amount) external",
  "function receiveETH() external payable",
];

// Contract Deployment
const interfacee = new ethers.Interface(abi);
const UNISWAP_V2_ROUTER = univ2; // Uniswap V2 Router address
const WETH_ADDRESS = (string = weth); // WETH address on mainnet

// Function to deploy contract, add liquidity, and perform wallet swaps in one bundle
async function automaticdeploy() {
  // Deploy contract
  let block = await provider.getBlock("latest");
  let maxBaseFeeInFutureBlock =
    FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, 1);
  let deployNonce = await wallet.getNonce();
  const contractBytecode = code;
  const contractFactory = new ethers.ContractFactory(
    contractABI,
    contractBytecode,
    wallet
  );

  // Deploy contract
  const deployTransaction = await contractFactory.getDeployTransaction();
  const deployTx = await wallet.signTransaction({
    ...deployTransaction,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: maxBaseFeeInFutureBlock + parseUnits(gwei, "gwei"),
    chainId: chainId,
    gasLimit: gaslimit,
    nonce: deployNonce,
  });
  // console.log(deployTx);
  const deployedContractAddress = ethers.getCreateAddress({
    from: wallet.address,
    nonce: deployNonce,
  });
  console.log("CA", deployedContractAddress);

  //  Send tokens to the deployed contract
  block = await provider.getBlock("latest");
  deployNonce++;
  const newMaxBaseFeeInFutureBlock =
    FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, 1);
  const sendTokensTx = {
    to: deployedContractAddress,
    data: interfacee.encodeFunctionData("receiveTokens", [
      parseUnits(liquidityToken, 18),
    ]),
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: newMaxBaseFeeInFutureBlock + parseUnits(gwei, "gwei"),
    chainId: chainId,
    gasLimit: gaslimit,
    nonce: deployNonce,
  };

  deployNonce++;

  // Step 3: Send ETH to the deployed contract
  const sendETHTx = {
    to: deployedContractAddress,
    data: interfacee.encodeFunctionData("receiveETH"),
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: newMaxBaseFeeInFutureBlock + parseUnits(gwei, "gwei"),
    value: parseUnits(liq, "ether"),
    gasLimit: gaslimit,
    chainId: chainId,
    nonce: deployNonce,
  };

  deployNonce++;

  // Step 4: Call openTrading method
  const openTradingTx = {
    to: deployedContractAddress,
    data: interfacee.encodeFunctionData("openTrading"),
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: newMaxBaseFeeInFutureBlock + parseUnits(gwei, "gwei"),
    chainId: chainId,
    gasLimit: gaslimit,
    nonce: deployNonce,
  };

  // Bundle transactions
  const signedTransactions = [];
  signedTransactions.push(deployTx);
  signedTransactions.push(await wallet.signTransaction(sendTokensTx));
  signedTransactions.push(await wallet.signTransaction(sendETHTx));
  signedTransactions.push(await wallet.signTransaction(openTradingTx));

  for (const config of walletConfigs) {
    const { privateKey, amount } = config;
    // const swapWallet = new ethers.Wallet(privateKey, provider);
    const swapWallet = wallet;

    deployNonce = await swapWallet.getNonce();
    block = await provider.getBlock("latest");
    maxBaseFeeInFutureBlock =
      FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
        block.baseFeePerGas,
        1
      );

    const swapTx = {
      to: UNISWAP_V2_ROUTER,
      data: interfacee.encodeFunctionData("swapETHForExactTokens", [
        parseEther(amount),
        [WETH_ADDRESS, deployedContractAddress],
        swapWallet.address,
        Math.floor(Date.now() / 1000) + 60 * 20,
      ]),
      value: parseEther(amount),
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      maxFeePerGas: maxBaseFeeInFutureBlock + parseUnits(gwei, "gwei"),
      chainId: chainId,
      gasLimit: gaslimit,
      nonce: deployNonce + 4
    };
    const signedSwapTx = await swapWallet.signTransaction(swapTx);
    signedTransactions.push(signedSwapTx);
  }
  // console.log(signedTransactions);
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    wallet,
    FLASHBOTS_ENDPOINT
  );

  block = await provider.getBlock("latest");

  const sign = await flashbotsProvider.signBundle(
    signedTransactions.map((tx) => ({ signedTransaction: tx }))
  );
  const simulation = await flashbotsProvider.simulate(sign, block.number + 1);
  if ("error" in simulation) {
    console.warn(`Simulation Error: ${simulation.error.message}`);
  } else {
    console.log(`Simulation Success: ${simulation}`);
    // Create an interface to listen for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt the user to press Enter to continue
    // Send the bundle
    rl.question(
      "Press Enter to continue and send the bundle, or any other key to exit...",
      async (input) => {
        if (input === "") {
          try {
            var bundleResponse = await flashbotsProvider.sendRawBundle(
              sign,
              block.number + 1
            );
            if ("error" in bundleResponse) {
              console.error(`Bundle Error: ${bundleResponse.error.message}`);
            } else {
              console.log("Bundle successfully sent!");

              let waitValue = await bundleResponse.wait(); // Initial wait value
              let maxRetries = 7;
              let retries = 0;

              while (waitValue !== 0 && retries < maxRetries) {
                retries++;

                console.log(
                  `Bundle not included, retrying... (attempt ${retries})`
                );

                // Resend the bundle
                block = await provider.getBlock("latest");
                bundleResponse = await flashbotsProvider.sendRawBundle(
                  sign,
                  block.number + 1
                );
                // console.log("Bundle", bundleResponse)
                if ("error" in bundleResponse) {
                  console.error(
                    `Bundle Error: ${bundleResponse.error.message}`
                  );
                } else {
                  // Wait for the transaction to be mined
                  waitValue = await bundleResponse.wait();
                  console.log("Flashbots bundle sent: Bundle Included!");

                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                if (waitValue === 0) {
                  console.log("Flashbots bundle finalized successfully!");
                } else {
                  console.log(
                    "Failed to finalize Flashbots bundle after",
                    retries,
                    "retries."
                  );
                }
              }
            }
          } catch (error) {
            console.error("Error sending the bundle:", error);
          }
        } else {
          console.log("Exiting without sending the bundle.");
        }
        // Close the readline interface
        rl.close();
      }
    );
  }
}

// Export the automaticdeploy function
module.exports = automaticdeploy;
