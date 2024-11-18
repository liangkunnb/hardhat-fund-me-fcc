const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {
          let deployer
          let fundMe
          const sendValue = "1000000000000000000"
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              //  await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("kkk", async function () {
              const fundTxResponse = await fundMe.fund({
                  value: sendValue,
              })
              await fundTxResponse.wait(1)

              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe
              )
              console.log(`endingFundMeBalance : ${endingFundMeBalance}`)

              assert.equal(endingFundMeBalance, 0)
          })
      })
