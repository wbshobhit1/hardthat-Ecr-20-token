const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { deploymentChains } = require("../helper-hardhat-config");

const INITIAL_SUPPLY = "1000000000000000000000000";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const BabuCoinToken = await deploy("BabuCoin", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Token deployed at ${BabuCoinToken.address}`);

  if (
    !deploymentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(BabuCoinToken.address, [INITIAL_SUPPLY]);
  }
};

module.exports.tags = ["all", "token"];
