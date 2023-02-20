# 项目介绍

1. 在原[erc-4337-examples](https://github.com/stackup-wallet/erc-4337-examples)项目的基础上实现了本地构造paymasterAndData的功能，而不需要通过stackup的[paymaster api](https://docs.stackup.sh/docs/api/paymaster/introduction#stackup-paymaster-api)，这是个收费的api。
2. 在goerli上部署并核验了用到的所有合约，方便我们直接在etherscan上调用函数以及查看数据。

# 前置步骤(已执行)
1. 在[Infinitism的discord](https://discord.com/invite/fbDyENb6Y9)查找[goerli上最新部署的EntryPoint地址](https://discord.com/channels/892780451570270219/892780453940056066/1061786895161491456)
2. 传入offchainSigner的账户地址和EntryPoint的合约地址部署VerifyingPaymaster.sol，质押eth（addStake）、在EntryPoint为paymaster充值eth（depositTo），参考[verifying_paymaster.test.ts](https://github.com/eth-infinitism/account-abstraction/blob/develop/test/verifying_paymaster.test.ts)
3. 给simpleAccount账户转账一些eth（通过`yarn run simpleAccount address`查询地址）
4. 给simpleAccount账户mint一些[erc20 token](https://goerli.etherscan.io/token/0x61a89342f52d9f31626b56b64a83579e5c368f4c)

# 使用步骤

1. 安装依赖：
```bash
yarn install
```

2. 编译合约、生成typechain代码
```bash
yarn hardhat compile
```

3. 启动bundler  
建议使用本地启动的bundler，方便查看日志，使用步骤见[stackup-bundler](https://github.com/stackup-wallet/stackup-bundler)。  
**需要注意的是**ERC4337_BUNDLER_PRIVATE_KEY对应的账户[必须持有足够支付gas fee的eth](https://discord.com/channels/874596133148696576/942772249662996520/1049685662305091584)，ERC4337_BUNDLER_ETH_CLIENT_URL对应的节点必须支持`debug_traceCall`。  
alchemy、infura、quicknode等[主流的节点提供商都不支持`debug_traceCall`](https://discord.com/channels/874596133148696576/942772249662996520/1066236623949418657)，而geth则需要full node才可以使用`debug_traceCall`，[snap和light均不支持](https://miaoguoge.xyz/geth-snap-rpc/)，这对本地机器资源要求较高。
所以我在[chainlist](https://chainlist.org/chain/5)上试了几个goerli的rpc server，下面这个看起来是可用的，测试命令如下：
```bash
curl https://goerli.blockpi.network/v1/rpc/public  \
-X POST \
-H "Content-Type: application/json" \
--data '{"method":"debug_traceCall","params":[{"from":null,"to":"0x6b175474e89094c44da98b954eedeac495271d0f","data":"0x70a082310000000000000000000000006E0d01A76C3Cf4288372a29124A26D4353EE51BE"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```

# 命令
### 获取simpleAccount账户地址
该账户为UserOperation的sender，是向[SimpleAccountFactory中的createAccount](https://goerli.etherscan.io/address/0xd9743aBf3031BD1B0b9B64a53307468677b4051B#writeContract)传入signingKey对应的账户地址创建出来的
```bash
yarn run simpleAccount address
```

### eth转账

```bash
yarn run simpleAccount transfer --to <address> --amount <eth>
```
例子：
```bash
yarn run simpleAccount transfer --to 0x413978328AA912d3fc63929d356d353F6e854Ee1 --amount 0.001
```

### erc20转账
```bash
yarn run simpleAccount erc20Transfer --token <address> --to <address> --amount <decimal>
```
例子：
```bash
yarn run simpleAccount erc20Transfer --token 0x61a89342F52d9F31626B56b64A83579E5c368f4c --to 0x413978328AA912d3fc63929d356d353F6e854Ee1 --amount 0.1
```
### 使用Paymaster

附加 `--withPaymaster`即可

```bash
yarn run simpleAccount:erc20Transfer --withPaymaster ...
```
例子：
```bash
yarn run simpleAccount erc20Transfer --token 0x61a89342F52d9F31626B56b64A83579E5c368f4c --to 0x413978328AA912d3fc63929d356d353F6e854Ee1 --amount 0.1 --withPaymaster
```

# 合约地址

[EntryPoint](https://goerli.etherscan.io/address/0x0F46c65C17AA6b4102046935F33301f0510B163A)  
[VerifyingPaymaster](https://goerli.etherscan.io/address/0xE0165B20422B0dC3802085D34013bA0E2a83f640)  
[TestToken](https://goerli.etherscan.io/token/0x61a89342f52d9f31626b56b64a83579e5c368f4c)  
[sender](https://goerli.etherscan.io/address/0x4Ed6e8753EE82D10952f4D720b30E8d2BCA09565)  
[SimpleAccountFactory](https://goerli.etherscan.io/address/0xd9743aBf3031BD1B0b9B64a53307468677b4051B)
