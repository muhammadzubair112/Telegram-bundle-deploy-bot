let { burnLockState, legitRugState, tgCreationState } = require('../state')

const start_keyboard = {
    inline_keyboard: [
      [{ text: "Quick", callback_data: "quick" }],
      [
        { text: "Settings", callback_data: "settings" },
        { text: "Manual", callback_data: "manual" },
      ],
      [
        { text: "Semi Auto", callback_data: "semi_auto" },
        { text: "Auto", callback_data: "auto" },
      ],
    ],
  };


  const back_keyboard = {
    inline_keyboard: [
      [{ text: "Quick", callback_data: "quick" }],
      [
        { text: "Settings", callback_data: "settings" },
        { text: "Manual", callback_data: "manual" },
      ],
      [
        { text: "Semi Auto", callback_data: "semi_auto" },
        { text: "Auto", callback_data: "auto" },
      ],
    ],
  };

  const back_setting = {
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

  const locker_keyboard = {
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

  const legit_rug_keyboard = {
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

  const tg_creation_keyboard = {
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

  const proxy_keyboard = {
    inline_keyboard: [
      [
        { text: "Deploy", callback_data: "proxy_deploy" },
        { text: "Delete", callback_data: "proxy_delete" },
      ],
      [{ text: "Back", callback_data: "back_setting" }],
    ],
  };

  const proxycon_keyboard = {
    inline_keyboard: [
      [
        { text: "Connect Contract", callback_data: "connect_contract" },
        { text: "Met Tx", callback_data: "met_tx" },
      ],
      [
        { text: "Whitelist", callback_data: "whitelist" },
        { text: "Blacklist", callback_data: "blacklist" },
      ],
      [
        { text: "RetireEth", callback_data: "retireEth" },
        { text: "Back", callback_data: "back_setting" },
      ],
    ],
  };

  const semi_auto_keyboard = {
    inline_keyboard: [
      [
        { text: "Deploy", callback_data: "deploy" },
        { text: "Lock/Burn Lp", callback_data: "lock_burn_lp" },
      ],
      [
        { text: "Remove Limits", callback_data: "remove_limit" },
        { text: "Renounce", callback_data: "renounce" },
      ],
      [
        { text: "Transfer", callback_data: "transfer" },
        { text: "End", callback_data: "end" },
      ],
      [{ text: "Back", callback_data: "back" }],
    ],
  };

  const quick_keyboard = {
    inline_keyboard: [
      [
        { text: "Deploy", callback_data: "deploy" },
        { text: "Lock/Burn Lp", callback_data: "lock_burn_lp" },
      ],
      [
        { text: "Remove Limits", callback_data: "remove_limit" },
        { text: "Renounce", callback_data: "renounce" },
      ],
      [
        { text: "Transfer", callback_data: "transfer" },
        { text: "End", callback_data: "end" },
      ],
      [{ text: "Back", callback_data: "back" }],
    ],
  };

  const auto_keyboard = {
    inline_keyboard: [
      [
        { text: "Deploy", callback_data: "deploy" },
        { text: "Transfer", callback_data: "transfer" },
      ],
      [
        { text: "End", callback_data: "end" },
        { text: "Back", callback_data: "back" },
      ],
    ],
  };

  const manual_keyboard = {
    inline_keyboard: [
      [
        { text: "Deploy", callback_data: "deploy" },   //manual deploy
        { text: "Token/ETH", callback_data: "token_eth" },
      ],
      [
        { text: "Enable", callback_data: "enable" },
        { text: "Lock/Burn Lp", callback_data: "lock_burn_lp" },
      ],
      [
        { text: "Remove Limits", callback_data: "remove_limit" },
        { text: "Renounce", callback_data: "renounce" },
      ],
      [
        { text: "Transfer", callback_data: "transfer" },
        { text: "End", callback_data: "end" },
      ],
      [{ text: "Back", callback_data: "back" }],
    ],
  };

  module.exports = { back_keyboard, back_setting, locker_keyboard, legit_rug_keyboard, tg_creation_keyboard, proxy_keyboard, proxycon_keyboard, semi_auto_keyboard,
    quick_keyboard,  auto_keyboard, manual_keyboard, start_keyboard
  }