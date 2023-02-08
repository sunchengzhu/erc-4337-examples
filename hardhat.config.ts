import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import {HardhatUserConfig} from 'hardhat/types'

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    solidity: {
        compilers: [{
            version: '0.8.17',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000000
                }
            }
        }]
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    }
}

export default config
