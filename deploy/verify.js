const { Web3 } = require("web3");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.alchemyUrl));

const getContract = require("../contract/getContract");
const delay = require("../library/delay");

const apiKey = process.env.etherscanKey;

const verifyContract = async (
  address,
  name,
  symbol,
  letterName,
  buyTax,
  sellTax,
  legit_rug_state,
  proxyca,
  comment
) => {
  console.log(
    "Verify Contract Params:",
    address,
    name,
    symbol,
    letterName,
    buyTax,
    sellTax,
    legit_rug_state,
    proxyca,
    comment
  );

  const sourceCode = getContract(
    name,
    symbol,
    letterName,
    buyTax,
    sellTax,
    legit_rug_state,
    comment
  );
  const verifycodePath = path.join(
    __dirname,
    "..",
    "verify/verifyContract.sol"
  );
  fs.writeFileSync(verifycodePath, sourceCode);
  let apiUrl = "";

  if (process.env.NETWORK == "mainnet") {
    apiUrl = "https://api.etherscan.io/api";
  } else {
    apiUrl = "https://api.etherscan.io/api";
  }
  console.log("apiUrl:", apiUrl);

  try {
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("module", "contract");
    formData.append("action", "verifysourcecode");
    formData.append("contractaddress", address);
    formData.append("sourceCode", sourceCode);
    formData.append("codeformat", "solidity-single-file");
    formData.append("compilerversion", "v0.8.23+commit.f704f362");
    formData.append("contractname", letterName);
    formData.append("optimizationUsed", 1);
    if (legit_rug_state) {
      const encodedParams = web3.eth.abi.encodeParameters(
        ["address"],
        [proxyca]
      );
      const sliceParams = encodedParams.slice(2);
      formData.append("constructorArguements", sliceParams);
    }

    formData.append("runs", 200);

    let response;
    let checkverifystatus = "0";
    await delay(Number(process.env.verifyDelay) * 1000);
    // await delay(14000);
    // console.log("timeChecker")
    response = await axios.post(apiUrl, formData);
    console.log(response.data);
    checkverifystatus = response.data.status;
    if (response.data.result == "Contract source code already verified") {
      checkverifystatus = "1";
    }
    console.log(checkverifystatus, "check1");
    await delay(5000);

    if (checkverifystatus == "0") {
      const formData1 = new FormData();
      formData1.append("apikey", apiKey);
      formData1.append("module", "contract");
      formData1.append("action", "verifysourcecode");
      formData1.append("contractaddress", address);
      formData1.append("sourceCode", sourceCode);
      formData1.append("codeformat", "solidity-single-file");
      formData1.append("compilerversion", "v0.8.23+commit.f704f362");
      formData1.append("contractname", letterName);
      formData1.append("optimizationUsed", 1);
      if (legit_rug_state) {
        const encodedParams = web3.eth.abi.encodeParameters(
          ["address"],
          [proxyca]
        );
        const sliceParams = encodedParams.slice(2);
        formData1.append("constructorArguements", sliceParams);
      }
      formData1.append("runs", 200);

      response = await axios.post(apiUrl, formData1);
      console.log(response.data);
      checkverifystatus = response.data.status;
      if (response.data.result == "Contract source code already verified") {
        checkverifystatus = "1";
      }

      await delay(5000);
      console.log(checkverifystatus, "check2");
      if (checkverifystatus == "0") {
        const formData2 = new FormData();
        formData2.append("apikey", apiKey);
        formData2.append("module", "contract");
        formData2.append("action", "verifysourcecode");
        formData2.append("contractaddress", address);
        formData2.append("sourceCode", sourceCode);
        formData2.append("codeformat", "solidity-single-file");
        formData2.append("compilerversion", "v0.8.23+commit.f704f362");
        formData2.append("contractname", letterName);
        formData2.append("optimizationUsed", 1);
        if (legit_rug_state) {
          const encodedParams = web3.eth.abi.encodeParameters(
            ["address"],
            [proxyca]
          );
          const sliceParams = encodedParams.slice(2);
          formData2.append("constructorArguements", sliceParams);
        }
        formData2.append("runs", 200);

        response = await axios.post(apiUrl, formData2);
        console.log(response.data);
        checkverifystatus = response.data.status;
        if (response.data.result == "Contract source code already verified") {
          checkverifystatus = "1";
        }
        console.log(checkverifystatus, "check3");
        await delay(3000);
      }
    }
    let status;
    let verifystatus;
    if (response.data.result == "Contract source code already verified") {
      return response.data;
    } else {
      if (checkverifystatus == "1") {
        await delay(10000);
        status = await axios.get(apiUrl, {
          params: {
            apikey: apiKey,
            module: "contract",
            action: "checkverifystatus",
            guid: response.data.result,
          },
        });

        verifystatus = status.data.status;
        if (status.data.result == "Already Verified") {
          verifystatus = "1";
        }
        console.log(verifystatus, status.data, "verify status1");

        if (verifystatus == "0") {
          await delay(3000);
          status = await axios.get(apiUrl, {
            params: {
              apikey: apiKey,
              module: "contract",
              action: "checkverifystatus",
              guid: response.data.result,
            },
          });

          verifystatus = status.data.status;
          if (status.data.result == "Already Verified") {
            verifystatus = "1";
          }
          console.log(verifystatus, status.data, "verify status2");
          if (verifystatus == "0") {
            await delay(3000);
            status = await axios.get(apiUrl, {
              params: {
                apikey: apiKey,
                module: "contract",
                action: "checkverifystatus",
                guid: response.data.result,
              },
            });

            verifystatus = status.data.status;
            if (status.data.result == "Already Verified") {
              verifystatus = "1";
            }
            console.log(verifystatus, status.data, "verify status3");
          }
        }
      } else {
        return response.data;
      }
    }

    console.log(status.data);
    return status.data;
  } catch (err) {
    console.log(err);
    return "Verify Error";
  }
};

module.exports = verifyContract;
