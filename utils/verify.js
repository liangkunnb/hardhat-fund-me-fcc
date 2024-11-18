// const { run } = require("hardhat")

// async function verify(contractAddress, args) {
//     console.log("验证...")
//     try {
//         await run("verify:verify", {
//             address: contractAddress,
//             constructorArguments: args,
//         })
//     } catch (e) {
//         if (e.message.toLowerCase().includes("already verified")) {
//             console.log("Already Verified!")
//         } else {
//             console.log(e)
//         }
//     }
//     console.log("验证完毕")
// }

// module.exports = { verify }

const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
