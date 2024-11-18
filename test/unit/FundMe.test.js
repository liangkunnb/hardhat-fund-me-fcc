const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

describe("FundMe", async function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = "1000000000000000000"

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response.address, mockV3Aggregator.address)
        })
    })

    describe("fund111", function () {
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        // we could be even more precise here by making sure exactly $50 works
        // but this is good enough for now
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            console.log(`wwww ${deployer}`)
            const response = await fundMe.getAddressToAmountFunded(deployer)
            // assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
        it("address is equal", async () => {
            await fundMe.fund({ value: sendValue })
            const send = await fundMe.getFunder(0)
            assert.equal(send.address, deployer.address)
        })
    })

    describe("withdraw", function () {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraws ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(fundMe)
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            // Assert
            // Maybe clean up to understand the testing
            assert.equal(endingFundMeBalance, 0)

            // assert.equal(
            //     startingFundMeBalance.add(startingDeployerBalance).toString(),
            //     endingDeployerBalance.add(gasCost).toString()
            // )

            assert.equal(
                startingFundMeBalance + startingDeployerBalance,
                endingDeployerBalance + gasCost
            )
        })

        it("is allows us to withdraw with multiple funders", async () => {
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const accounts = await ethers.getSigners()
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            console.log(`fundMe.getFunder(0): ${fundMe.getFunder(0).address}`)
            const transactionResponse = await fundMe.withdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const withdrawGasCost = gasUsed * gasPrice
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${gasPrice}`)
            const endingFundMeBalance = await ethers.provider.getBalance(fundMe)
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance + startingDeployerBalance,
                endingDeployerBalance + withdrawGasCost
            )

            //     await expect(fundMe.funders(0)).to.be.revertedWith()

            for (i = 1; i < 6; i++) {
                const money = await fundMe.getAddressToAmountFunded(
                    accounts[i].address
                )
                assert.equal(money, 0)
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.rejectedWith(
                "FundMe__NotOwner"
            )
        })
    })
})
