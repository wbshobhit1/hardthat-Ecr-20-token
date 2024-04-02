const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { deploymentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

const INITIAL_SUPPLY = "1000000000000000000000000";

!deploymentChains.includes(network.name)
  ? describe.skip
  : describe("BabuToken Unit Test", function () {
      const multiplier = 10 ** 18;
      let ourToken, deployer, user1;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        user1 = (await getNamedAccounts()).user1;

        await deployments.fixture("all");

        const myToken = await deployments.get("BabuCoin");
        ourToken = await ethers.getContractAt(myToken.abi, myToken.address);
      });
      it("was deployed", async () => {
        assert(ourToken.address);
      });
      describe("Constructor", function () {
        it("Should have correct INITIAL_SUPPLY of token", async function () {
          const totalSupply = await ourToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
          const name = (await ourToken.name()).toString();
          assert.equal(name, "BabuCoin");

          const symbol = (await ourToken.symbol()).toString();
          assert.equal(symbol, "BCN");
        });
      });

      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.utils.parseEther("1000000");
          await ourToken.transfer(deployer, tokensToSend);

          expect(await ourToken.balanceOf(deployer)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            ourToken.transfer(deployer, (10 * multiplier).toString())
          ).to.emit(ourToken, "Transfer");
        });
      });

      describe("allowances", () => {
        const amount = (20 * multiplier).toString();
        beforeEach(async () => {
          const myTokenPlayer = await deployments.get("BabuCoin");
          playerToken = await ethers.getContractAt(
            myTokenPlayer.abi,
            myTokenPlayer.address
          );
        });
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.utils.parseEther("5");
          //Deployer is approving that user1 can spend 5 of their precious OT's
          await ourToken.approve(user1, tokensToSpend);
          await playerToken.transferFrom(deployer, user1, tokensToSpend);
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("doesn't allow an unnaproved member to do transfers", async () => {
          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it("emits an approval event, when an approval occurs", async () => {
          await expect(ourToken.approve(user1, amount)).to.emit(
            ourToken,
            "Approval"
          );
        });
        it("the allowance being set is accurate", async () => {
          await ourToken.approve(user1, amount);
          const allowance = await ourToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("won't allow a user to go over the allowance", async () => {
          await ourToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
    });
