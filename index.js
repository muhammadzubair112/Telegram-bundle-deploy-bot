require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const fs = require("fs");
const config = require('./config')

const automaticdeploy = require("./deploy/buildBundler");
const deploy = require("./deploy/deploy");
const proxyDeploy = require("./deploy/proxyDeploy");
const verifyContract = require("./deploy/verify");
const tokenEth = require("./deploy/tokenEth");
const enable = require("./deploy/enable");
const removeLimit = require("./deploy/removeLimit");
const renounce = require("./deploy/renounce");
const returnEth = require("./deploy/returnEth");
const burn = require("./deploy/burn");
const locker = require("./deploy/locker");
const getRandomInt = require("./library/random");
const checkWallet = require("./library/checkWallet");
const semiTokenEth = require("./deploy/semiTokenEth");
const metContract = require("./deploy/metContract");
const metTx = require("./deploy/metTx");
const metWhitelist = require("./deploy/metWhitelist");
const metBlacklist = require("./deploy/metBlacklist");
const metRetireEth = require("./deploy/metRetireEth");
const delay = require("./library/delay");
const isNumeric = require("./library/isNumeric");
const randomName = require("./library/radomName");
const {
  connectClient,
  createGroup,
  createChannel,
  updateUsername,
  safeGuardeditAdminChannel,
  safeGuardeditAdminGroup,
  addSafeGuardToChannel,
} = require("./portal/index");

const { back_keyboard, back_setting, locker_keyboard, legit_rug_keyboard, tg_creation_keyboard, proxy_keyboard, proxycon_keyboard, semi_auto_keyboard, quick_keyboard, auto_keyboard, manual_keyboard, start_keyboard } = require("./ui/keyboard");

let { burnLockState, legitRugState, tgCreationState } = require('./state')

const BOT_TOKEN = config.BOT_TOKEN;

try{

  bot = new TelegramBot(BOT_TOKEN, { polling: true, });
}catch(error){
  console.log(error);
}


const taxPairs = [
  {
    buyTax: 18,
    sellTax: 18,
  },
  {
    buyTax: 20,
    sellTax: 20,
  },
  {
    buyTax: 23,
    sellTax: 23,
  },
];

let keys = [process.env.PRIVATE_KEY];
let taxLoop = 0;
let name;
let symbol;
let letterName;
let address;

let proxyca = "";
let step = "start";
let autoMode = 0;

const main = async () => {
  // await connectClient();
};

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const data = query.data;

    // Handle button actions
    if (data === "settings") {

      const settings_keyboard = {
        inline_keyboard: [
          [
            { text: "Add Wallet", callback_data: "add_wallet" },
            { text: "View Wallets", callback_data: "view_wallets" },
          ],
          [
            { text: "Verify", callback_data: "verify" },
            {
              text: `${burnLockState ? "🟢   Lock" : "🔴   Burn"}`,
              callback_data: "locker",
            },
          ],
          [
            { text: "Proxy", callback_data: "proxy" },
            {
              text: `${legitRugState ? "🔴   Rug" : "🟢   Legit"}`,
              callback_data: "legit_rug",
            },
          ],
          [
            { text: "Proxy Control", callback_data: "proxycon" },
            {
              text: `${
                tgCreationState
                  ? "🟢 Telegram Creation"
                  : "🔴 Telegram Creation"
              }`,
              callback_data: "tgcreationstate",
            },
          ],
          [{ text: "Back", callback_data: "back" }],
        ],
      };

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }

      bot.sendMessage(chatId, "=========== Settings ===========", {
        reply_markup: JSON.stringify(settings_keyboard),
      });
    }
    
    if (data === "back") {

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "It's the bot that deploys token automatically", {
        reply_markup: JSON.stringify(back_keyboard),
      });
    }
    
    if (data === "back_setting") {


      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "=========== Settings ===========", {
        reply_markup: JSON.stringify(back_setting),
      });
    } 
    
     if (data === "add_wallet") {
      step = "add_wallet";
      bot.sendMessage(chatId, "Please add the wallet private Keys");
    }
    
     else if (data === "view_wallets") {
      const wallets = await checkWallet(keys);
      console.log("User Wallet", wallets);
      if (wallets.length > 0) {
        let walletString = "";
        for (let i = 0; i < wallets.length; i++) {
          walletString += wallets[i] + "\n";
        }
        walletString += `\n${wallets.length} wallets added`;
        bot.sendMessage(chatId, walletString);
      } else {
        bot.sendMessage(chatId, "There is no wallet added");
      }
    } else if (data === "verify") {
      step = "verify";
      bot.sendMessage(chatId, "Please type '/verify'");
    } 
    
    if (data === "locker") {
      burnLockState = !burnLockState;

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "=========== Settings ===========", {
        reply_markup: JSON.stringify(locker_keyboard),
      });
    }
    
     if (data === "legit_rug") {
      if (proxyca == "" && legitRugState == false) {
        bot.sendMessage(chatId, "Please deploy proxy contract");
      } else {
        legitRugState = !legitRugState;
        console.log("Legit rug state:", legitRugState);

        if (query.message.message_id) {
          bot.deleteMessage(chatId, query.message.message_id);
        }
        bot.sendMessage(chatId, "=========== Settings ===========", {
          reply_markup: JSON.stringify(legit_rug_keyboard),
        });
      }
    } else if (data === "tgcreationstate") {
      tgCreationState = !tgCreationState;


      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "=========== Settings ===========", {
        reply_markup: JSON.stringify(tg_creation_keyboard),
      });
    }
    
    if (data === "proxy") {

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "==== Settings -> Proxy ====", {
        reply_markup: JSON.stringify(proxy_keyboard),
      });

    }
    
    if (data === "proxy_deploy") {
      const proxyData = await proxyDeploy(process.env.proxyDeployer);
      if (proxyData.status == 1) {
        proxyca = proxyData.data;
        bot.sendMessage(chatId, `Proxy contract deployed at ${proxyData.data}`);
      } else {
        bot.sendMessage(chatId, proxyData.data);
      }
    }
    
    if (data === "proxy_delete") {
      proxyca = "";
      bot.sendMessage(chatId, `Successfully removed Proxy`);
    }
    
    if (data === "proxycon") {
      if (proxyca) {

        if (query.message.message_id) {
          bot.deleteMessage(chatId, query.message.message_id);
        }
        bot.sendMessage(chatId, "=== Settings -> Proxy Control ===", {
          reply_markup: JSON.stringify(proxycon_keyboard),
        });
      } else {
        bot.sendMessage(chatId, "Please deploy proxy contract");
      }
    }
    
    if (data === "connect_contract") {
      if (proxyca && address) {
        const metConData = await metContract(
          proxyca,
          address,
          process.env.proxyDeployer
        );
        if (metConData.status == 1) {
          bot.sendMessage(
            chatId,
            `Connect Contract Done\n\n${
              process.env.network == "mainnet"
                ? "https://etherscan.io"
                : "https://etherscan.io"
            }/tx/${metConData.data}`,
            { disable_web_page_preview: true }
          );
        } else {
          bot.sendMessage(chatId, metConData.data);
        }
      } else {
        bot.sendMessage(
          chatId,
          "please check if you deployed proxy and main contract"
        );
      }
    }
    
    if (data === "met_tx") {
      if (proxyca && keys.length > 0) {
        step = "met_tx";
        bot.sendMessage(chatId, "Please insert TxCount");
      } else {
        bot.sendMessage(chatId, "No proxy contract or wallets");
      }
    }
    
     if (data === "whitelist") {
      if (proxyca && keys.length > 0) {
        step = "whitelist";
        bot.sendMessage(chatId, "Please insert whitelist wallets");
      } else {
        bot.sendMessage(chatId, "No proxy contract or wallets");
      }
    }
    
    if (data === "blacklist") {
      if (proxyca && keys.length > 0) {
        step = "blacklist";
        bot.sendMessage(chatId, "Please insert blacklist wallets");
      } else {
        bot.sendMessage(chatId, "No proxy contract or wallets");
      }
    }
    
     if (data === "retireEth") {
      if (proxyca && keys.length > 0) {
        step = "retireEth";
        bot.sendMessage(chatId, "Please insert count");
      } else {
        bot.sendMessage(chatId, "No proxy contract or wallets");
      }
    }
    
    if (data === "semi_auto") {
      autoMode = 1;

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "====== Semi Auto Mode ======", {
        reply_markup: JSON.stringify(semi_auto_keyboard),
      });
    }
    
    if (data === "quick") {
      autoMode = 1;

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "====== Quick Mode ======", {
        reply_markup: JSON.stringify(quick_keyboard),
      });
    }
    
    if (data === "auto") {
      autoMode = 2;

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "========== Auto Mode ==========", {
        reply_markup: JSON.stringify(auto_keyboard),
      });
    }
    
    if (data === "manual") {
      autoMode = 0;

      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "======== Manual Mode ========", {
        reply_markup: JSON.stringify(manual_keyboard),
      });
    }
    
    if (data === "deploy") {
      if (keys.length > 0) {
        step = 'deploy';
        bot.sendMessage(chatId, 'Name / Symbol');
        // call from buildbundler

        // Instead of your existing logic here, call automaticdeploy
        await automaticdeploy(); // Call automaticdeploy to perform the contract deployment and other operations
        bot.sendMessage(chatId, "Automatic deployment initiated.");

      } else {
        bot.sendMessage(chatId, "No wallets");
      }
    }
    
    if (data === "token_eth") {
      if (address) {
        // step = 'token_eth'
        const tokenEData = await tokenEth(address, keys[0], legitRugState);
        if (tokenEData.status == 1) {
          bot.sendMessage(chatId, "Token/Eth Done");
        } else {
          bot.sendMessage(chatId, tokenEData.data);
        }
      }
    }
    
    if (data === "enable") {
      if (address) {
        const enableData = await enable(address, keys[0], legitRugState);
        if (enableData.status == 1) {
          bot.sendMessage(
            chatId,
            `Enable Done\n\n${
              process.env.network == "mainnet"
                ? "https://etherscan.io"
                : "https://etherscan.io"
            }/tx/${enableData.data}`,
            { disable_web_page_preview: true }
          );
        } else {
          bot.sendMessage(chatId, enableData.data);
        }
      }
      if (tgCreationState) {
        await safeGuardeditAdminChannel();
        await safeGuardeditAdminGroup();
        await addSafeGuardToChannel(address);
      }
    }
    
    if (data === "lock_burn_lp") {
      if (address) {
        if (burnLockState == false) {
          const burnData = await burn(address, keys[0]);
          if (burnData.status == 1) {
            bot.sendMessage(
              chatId,
              `Burn Lp Done\n\n ${
                process.env.network == "mainnet"
                  ? "https://etherscan.io"
                  : "https://etherscan.io"
              }/tx/${burnData.data}`,
              { disable_web_page_preview: true }
            );
          } else {
            bot.sendMessage(chatId, burnData.data);
          }
        } else {
          const lockData = await locker(address, keys[0]);
          if (lockData.status == 1) {
            bot.sendMessage(
              chatId,
              `Lock Lp Done\n\n ${
                process.env.network == "mainnet"
                  ? "https://etherscan.io"
                  : "https://etherscan.io"
              }/tx/${lockData.data[1]}`,
              { disable_web_page_preview: true }
            );
          } else {
            bot.sendMessage(chatId, lockData.data);
          }
        }
      } else {
        bot.sendMessage(chatId, "Token is not deployed");
      }
    }
    
    if (data === "remove_limit") {
      if (address) {
        const removeData = await removeLimit(address, keys[0], legitRugState);
        if (removeData.status == 1) {
          bot.sendMessage(
            chatId,
            `Remove Limist Done\n\n ${
              process.env.network == "mainnet"
                ? "https://etherscan.io"
                : "https://etherscan.io"
            }/tx/${removeData.data}`,
            { disable_web_page_preview: true }
          );
        } else {
          bot.sendMessage(chatId, removeData.data);
        }
      }
    }
    
    if (data === "renounce") {
      if (address) {
        const renounceData = await renounce(address, keys[0], legitRugState);
        if (renounceData.status == 1) {
          bot.sendMessage(
            chatId,
            `Renounce Done\n\n ${
              process.env.network == "mainnet"
                ? "https://etherscan.io"
                : "https://etherscan.io"
            }/tx/${renounceData.data}`,
            { disable_web_page_preview: true }
          );
        } else {
          bot.sendMessage(chatId, renounceData.data);
        }
      }
    }
    
    if (data === "transfer") {
      const ethData = await returnEth(keys[0]);
      if (ethData.status == 1) {
        bot.sendMessage(
          chatId,
          `Transfer Done\n\n ${
            process.env.network == "mainnet"
              ? "https://etherscan.io"
              : "https://etherscan.io"
          }/tx/${ethData.data}`,
          { disable_web_page_preview: true }
        );
      } else {
        bot.sendMessage(chatId, ethData.data);
      }
    }
    
    if (data === "end") {
      keys.shift();
      step = "start";
      bot.sendMessage(chatId, "Finished the deployment");
    }
  } catch (err) {
    console.log("error", err);
  }
});

bot.on("message", async (msg) => {
  try {
    console.log(msg.text)
    const chatId = msg.chat.id;
    console.log(chatId, step);

      if (msg.text === "/start") {
        step = "start";
        const chatId = msg.chat.id;

        bot.sendMessage(
          chatId,
          "It's the bot that deploys token automatically",
          {
            reply_markup: JSON.stringify(start_keyboard),
            //reply_to_message_id: msg.message_id
          }
        );
      } 
      
      if (msg.text === "/verify") {
        step = "verify_comment";
        bot.sendMessage(
          chatId,
          "You wanna add the comment in the code before verify it?"
        );
      }
      
      if (step === "verify_comment") {
        if (address && name && symbol) {
          let comment;
          if (msg.text == "/none") {
            comment = "";
            const status = await verifyContract(
              address,
              name,
              symbol,
              letterName,
              taxPairs[taxLoop]?.buyTax,
              taxPairs[taxLoop]?.sellTax,
              legitRugState,
              proxyca,
              comment
            );
            // const verifyPath = path.join(__dirname, 'verify/verifyContract.sol');
            // const fileStream = fs.createReadStream(verifyPath);
            // await bot.sendDocument(chatId, fileStream)

            if (status?.result) {
              bot.sendMessage(chatId, status?.result);
            } else {
              bot.sendMessage(chatId, "Verify Error");
            }

            step = "start";
          } else {
            comment = msg.text;
            const lines = comment.split("\n");
            const allLinesIncludeDoubleSlash = lines.every((line) =>
              /^\/\//.test(line.trim())
            );

            const isValid = /^\s*\/\*\*(\s*\*\s*.*\n)*\s*\*\/\s*$/.test(
              comment
            );
            const isValid1 = /^\s*\/\*[\s\S]*\*\/\s*$/.test(comment);
            console.log(allLinesIncludeDoubleSlash, isValid, isValid1);
            if (allLinesIncludeDoubleSlash || isValid || isValid1) {
              const status = await verifyContract(
                address,
                name,
                symbol,
                letterName,
                taxPairs[taxLoop]?.buyTax,
                taxPairs[taxLoop]?.sellTax,
                legitRugState,
                proxyca,
                comment
              );
              const verifyPath = path.join(
                __dirname,
                "verify/verifyContract.sol"
              );
              const fileStream = fs.createReadStream(verifyPath);
              await bot.sendDocument(chatId, fileStream);
              if (status?.result) {
                bot.sendMessage(chatId, status?.result);
              } else {
                bot.sendMessage(chatId, "Verify Error");
              }
              step = "start";
            } else {
              bot.sendMessage(chatId, "Please add the correct type!");
            }
          }
        } else {
          bot.sendMessage(chatId, "There is no deployed token");
        }
      } 
      
       if (step === "add_wallet") {
        const privateKeyRegex = /[0-9a-fA-F]{64}/g;

        const privateKeys = msg.text.match(privateKeyRegex);

        if (privateKeys) {
          console.log(privateKeys);
          keys = privateKeys;
          bot.sendMessage(
            chatId,
            `Successfully added ${privateKeys.length}wallets`
          );
          step = "start";
        } else {
          // console.log('No private keys found.');
          bot.sendMessage(chatId, "Not found wallets");
        }
      }
      
      if (step === "deploy") {
        if (keys.length > 0) {
          const parts = msg.text.split("\n");
          name = parts[0]?.trim();
          symbol = parts[1]?.trim();
          letterName = parts[0]?.replace(/[^\p{L}]/gu, "");
          let portalLink;
          if (name && symbol) {
            if (proxyca == "" && legitRugState === true) {
              bot.sendMessage(chatId, "Please deploy proxy contract");
            } else {
              taxLoop = getRandomInt(3);
              console.log(taxPairs[taxLoop], "Tax");
              if (letterName === "") {
                letterName = randomName(5);
              }

              if (autoMode === 0) {
                try {
                  deployData = await deploy(
                    name,
                    symbol,
                    letterName,
                    taxPairs[taxLoop].buyTax,
                    taxPairs[taxLoop].sellTax,
                    keys[0],
                    legitRugState,
                    proxyca
                  );
                  if (deployData.status == 1) {
                    bot.sendMessage(chatId, `Deployed: ${deployData.data}`);
                    address = deployData.data;
                    step = "start";
                  } else {
                    bot.sendMessage(chatId, deployData.data);
                  }

                  if (legitRugState) {
                    const metConData = await metContract(
                      proxyca,
                      address,
                      process.env.proxyDeployer
                    );
                    if (metConData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Connect Contract Done\n\n${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${metConData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, metConData.data);
                    }
                  }

                  if (tgCreationState) {
                    await createChannel(name);
                    const updateUsernameData = await updateUsername(letterName);
                    portalLink = updateUsernameData.data;
                    createGroup(name);
                  }
                  if (tgCreationState) {
                    let comment = `/*\n   ${portalLink}\n\n*/`;
                    console.log(comment);
                    const status = await verifyContract(
                      address,
                      name,
                      symbol,
                      letterName,
                      taxPairs[taxLoop]?.buyTax,
                      taxPairs[taxLoop]?.sellTax,
                      legitRugState,
                      proxyca,
                      comment
                    );
                    const verifyPath = path.join(
                      __dirname,
                      "verify/verifyContract.sol"
                    );
                    const fileStream = fs.createReadStream(verifyPath);

                    if (status?.result) {
                      bot.sendMessage(chatId, status?.result);
                    } else {
                      await bot.sendDocument(chatId, fileStream);
                      bot.sendMessage(chatId, "Verify Error");
                    }
                  }
                } catch (err) {
                  console.log(err);
                }
              } else if (autoMode === 1) {
                try {
                  deployData = await deploy(
                    name,
                    symbol,
                    letterName,
                    taxPairs[taxLoop].buyTax,
                    taxPairs[taxLoop].sellTax,
                    keys[0],
                    legitRugState,
                    proxyca
                  );
                  if (deployData.status == 1) {
                    bot.sendMessage(chatId, `Deployed: ${deployData.data}`);
                    address = deployData.data;
                    step = "start";
                  } else {
                    bot.sendMessage(chatId, deployData.data);
                  }

                  if (legitRugState) {
                    const metConData = await metContract(
                      proxyca,
                      address,
                      process.env.proxyDeployer
                    );
                    if (metConData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Connect Contract Done\n\n${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${metConData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, metConData.data);
                    }
                  }
                  await delay(Number(process.env.semiDeToEth) * 1000);
                  if (address) {
                    const tokenEData = await semiTokenEth(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (tokenEData.status == 1) {
                      bot.sendMessage(chatId, "Token/Eth Done");
                    } else {
                      bot.sendMessage(chatId, tokenEData.data);
                    }
                  }
                  await delay(Number(process.env.semiToEthEn) * 1000);
                  if (address) {
                    const enableData = await enable(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (enableData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Enable Done\n\n${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${enableData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, enableData.data);
                    }
                  }
                  if (tgCreationState) {
                    await createChannel(name);
                    const updateUsernameData = await updateUsername(letterName);
                    portalLink = updateUsernameData.data;
                    createGroup(name);
                  }
                  if (tgCreationState) {
                    let comment = `/*\n   ${portalLink}\n\n*/`;
                    const status = await verifyContract(
                      address,
                      name,
                      symbol,
                      letterName,
                      taxPairs[taxLoop]?.buyTax,
                      taxPairs[taxLoop]?.sellTax,
                      legitRugState,
                      proxyca,
                      comment
                    );
                    const verifyPath = path.join(
                      __dirname,
                      "verify/verifyContract.sol"
                    );
                    const fileStream = fs.createReadStream(verifyPath);

                    if (status?.result) {
                      bot.sendMessage(chatId, status?.result);
                    } else {
                      await bot.sendDocument(chatId, fileStream);
                      bot.sendMessage(chatId, "Verify Error");
                    }
                  }
                  if (tgCreationState) {
                    await safeGuardeditAdminChannel();
                    await safeGuardeditAdminGroup();
                    await addSafeGuardToChannel(address);
                  }
                } catch (err) {
                  console.log(err);
                }
              } else if (autoMode === 2) {
                try {
                  deployData = await deploy(
                    name,
                    symbol,
                    letterName,
                    taxPairs[taxLoop].buyTax,
                    taxPairs[taxLoop].sellTax,
                    keys[0],
                    legitRugState,
                    proxyca
                  );
                  if (deployData.status == 1) {
                    bot.sendMessage(chatId, `Deployed: ${deployData.data}`);
                    address = deployData.data;
                    step = "start";
                  } else {
                    bot.sendMessage(chatId, deployData.data);
                  }

                  if (legitRugState) {
                    const metConData = await metContract(
                      proxyca,
                      address,
                      process.env.proxyDeployer
                    );
                    if (metConData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Connect Contract Done\n\n${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${metConData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, metConData.data);
                    }
                  }
                  await delay(Number(process.env.autoDeToEth) * 1000);
                  if (address) {
                    const tokenEData = await tokenEth(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (tokenEData.status == 1) {
                      bot.sendMessage(chatId, "Token/Eth Done");
                    } else {
                      bot.sendMessage(chatId, tokenEData.data);
                    }
                  }
                  await delay(Number(process.env.autoToEthEn) * 1000);
                  if (address) {
                    const enableData = await enable(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (enableData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Enable Done\n\n${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${enableData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, enableData.data);
                    }
                  }
                  if (tgCreationState) {
                    await createChannel(name);
                    const updateUsernameData = await updateUsername(letterName);
                    portalLink = updateUsernameData.data;
                    createGroup(name);
                  }
                  if (tgCreationState) {
                    let comment = `/*\n   ${portalLink}\n\n*/`;
                    const status = await verifyContract(
                      address,
                      name,
                      symbol,
                      letterName,
                      taxPairs[taxLoop]?.buyTax,
                      taxPairs[taxLoop]?.sellTax,
                      legitRugState,
                      proxyca,
                      comment
                    );
                    const verifyPath = path.join(
                      __dirname,
                      "verify/verifyContract.sol"
                    );
                    const fileStream = fs.createReadStream(verifyPath);

                    if (status?.result) {
                      bot.sendMessage(chatId, status?.result);
                    } else {
                      await bot.sendDocument(chatId, fileStream);
                      bot.sendMessage(chatId, "Verify Error");
                    }
                  }
                  if (tgCreationState) {
                    await safeGuardeditAdminChannel();
                    await safeGuardeditAdminGroup();
                    await addSafeGuardToChannel(address);
                  }

                  await delay(Number(process.env.autoEnBurn) * 1000);
                  if (address) {
                    if (burnLockState == false) {
                      const burnData = await burn(address, keys[0]);
                      if (burnData.status == 1) {
                        bot.sendMessage(
                          chatId,
                          `Burn Lp Done\n\n ${
                            process.env.network == "mainnet"
                              ? "https://etherscan.io"
                              : "https://etherscan.io"
                          }/tx/${burnData.data}`,
                          { disable_web_page_preview: true }
                        );
                      } else {
                        bot.sendMessage(chatId, burnData.data);
                      }
                    } else {
                      const lockData = await locker(address, keys[0]);
                      if (lockData.status == 1) {
                        bot.sendMessage(
                          chatId,
                          `Lock Lp Done\n\n ${
                            process.env.network == "mainnet"
                              ? "https://etherscan.io"
                              : "https://etherscan.io"
                          }/tx/${lockData.data[1]}`,
                          { disable_web_page_preview: true }
                        );
                      } else {
                        bot.sendMessage(chatId, lockData.data);
                      }
                    }
                  }

                  await delay(Number(process.env.autoBurnLimit) * 1000);
                  if (address) {
                    const removeData = await removeLimit(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (removeData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Remove Limist Done\n\n ${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${removeData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, removeData.data);
                    }
                  }
                  await delay(Number(process.env.autoLimitReno) * 1000);
                  if (address) {
                    const renounceData = await renounce(
                      address,
                      keys[0],
                      legitRugState
                    );
                    if (renounceData.status == 1) {
                      bot.sendMessage(
                        chatId,
                        `Renounce Done\n\n ${
                          process.env.network == "mainnet"
                            ? "https://etherscan.io"
                            : "https://etherscan.io"
                        }/tx/${renounceData.data}`,
                        { disable_web_page_preview: true }
                      );
                    } else {
                      bot.sendMessage(chatId, renounceData.data);
                    }
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
          } else {
            bot.sendMessage(chatId, "Please type name and symbol correctly");
          }
        } else {
          console.log("No deployer wallets");
          bot.sendMessage(chatId, `No deployer wallets`);
        }
      } else if (step === "met_tx") {
        if (proxyca) {
          const counts = msg.text.split("\n");
          if (
            counts[0] &&
            counts[1] &&
            isNumeric(counts[0]) &&
            isNumeric(counts[1])
          ) {
            const metTxData = await metTx(
              proxyca,
              process.env.proxyDeployer,
              Number(counts[0]),
              Number(counts[1])
            );
            if (metTxData.status == 1) {
              bot.sendMessage(
                chatId,
                `MetTx Done\n\n ${
                  process.env.network == "mainnet"
                    ? "https://etherscan.io"
                    : "https://etherscan.io"
                }/tx/${metTxData.data}`,
                { disable_web_page_preview: true }
              );
            } else {
              bot.sendMessage(chatId, metTxData.data);
            }
            step = "start";
          } else {
            bot.sendMessage(chatId, `Please insert exact NUMBER`);
          }
        } else {
          bot.sendMessage(chatId, `No proxy contract`);
        }
      } else if (step === "whitelist") {
        if (proxyca) {
          const whitelistRegex = /0x[0-9a-fA-F]{40}/g;

          const whitelistAddr = msg.text.match(whitelistRegex);

          if (whitelistAddr) {
            console.log(whitelistAddr);
            whitelistData = await metWhitelist(
              proxyca,
              process.env.proxyDeployer,
              whitelistAddr
            );
            if (whitelistData.status == 1) {
              bot.sendMessage(
                chatId,
                `Whitelist Done\n\n ${
                  process.env.network == "mainnet"
                    ? "https://etherscan.io"
                    : "https://etherscan.io"
                }/tx/${whitelistData.data}`,
                { disable_web_page_preview: true }
              );
            } else {
              bot.sendMessage(chatId, whitelistData.data);
            }
            step = "start";
          } else {
            bot.sendMessage(chatId, "Not found whitelist addresses");
          }
        } else {
          bot.sendMessage(chatId, `No proxy contract`);
        }
      } else if (step === "blacklist") {
        if (proxyca) {
          const blacklistRegex = /0x[0-9a-fA-F]{40}/g;

          const blacklistAddr = msg.text.match(blacklistRegex);

          if (blacklistAddr) {
            console.log(blacklistAddr);
            blacklistData = await metBlacklist(
              proxyca,
              process.env.proxyDeployer,
              blacklistAddr
            );
            if (blacklistData.status == 1) {
              bot.sendMessage(
                chatId,
                `Blacklist Done\n\n ${
                  process.env.network == "mainnet"
                    ? "https://etherscan.io"
                    : "https://etherscan.io"
                }/tx/${blacklistData.data}`,
                { disable_web_page_preview: true }
              );
            } else {
              bot.sendMessage(chatId, blacklistData.data);
            }
            step = "start";
          } else {
            bot.sendMessage(chatId, "Not found whitelist addresses");
          }
        } else {
          bot.sendMessage(chatId, `No proxy contract`);
        }
      } else if (step === "retireEth") {
        if (proxyca) {
          if (isNumeric(msg.text)) {
            const count = Number(msg.text);
            const retireData = await metRetireEth(
              proxyca,
              process.env.proxyDeployer,
              count
            );
            if (retireData.status == 1) {
              bot.sendMessage(
                chatId,
                `RetireEth Done\n\n ${
                  process.env.network == "mainnet"
                    ? "https://etherscan.io"
                    : "https://etherscan.io"
                }/tx/${retireData.data}`,
                { disable_web_page_preview: true }
              );
            } else {
              bot.sendMessage(chatId, retireData.data);
            }
            step = "start";
          } else {
            bot.sendMessage(chatId, `Please insert exact NUMBER`);
          }
        } else {
          bot.sendMessage(chatId, `No proxy contract`);
        }
      }

  } catch (err) {
    console.log(err);
    // console.log('error catch')
  }
});

main();
