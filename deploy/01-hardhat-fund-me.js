const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //判断地址
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        //获取喂价地址
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        //链上
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`fundme address: ${fundme.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, args)
    }
}

module.exports.tags = ["all", "fundme"]

// const { network, ethers, getNamedAccounts } = require("hardhat")
// const { developmentChains } = require("../helper-hardhat-config")
// const { assert } = require("chai")

// developmentChains.includes(network.name)
//     ? describe.skip
//     : describe("FundMe Staging Tests", async function () {
//           let deployer
//           let fundMe
//           const sendValue = "1000000000000000000"
//           beforeEach(async function () {
//               deployer = (await getNamedAccounts()).deployer
//               //  await deployments.fixture(["all"])
//               fundMe = await ethers.getContract("FundMe", deployer)
//           })

//           it("kkk", async function () {
//               const fundTxResponse = await fundMe.fund({
//                   value: sendValue,
//               })
//               await fundTxResponse.wait(1)

//               const withdrawTxResponse = await fundMe.withdraw()
//               await withdrawTxResponse.wait(1)

//               const endingFundMeBalance = await ethers.provider.getBalance(
//                   fundMe
//               )
//               console.log(`endingFundMeBalance : ${endingFundMeBalance}`)

//               assert.equal(endingFundMeBalance, 0)
//           })
//       })
