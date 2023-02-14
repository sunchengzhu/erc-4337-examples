import {ethers} from 'ethers'
import {PaymasterAPI, calcPreVerificationGas} from "@account-abstraction/sdk";
import {UserOperationStruct} from "@account-abstraction/contracts";
import {arrayify, hexConcat} from "ethers/lib/utils";
import {VerifyingPaymaster__factory} from "../typechain";
import {JsonRpcProvider} from "@ethersproject/providers";
import {printOp} from "./opUtils";


const ADDR_SIZE = 20;
const SIG_SIZE = 65;

class VerifyingPaymasterAPI extends PaymasterAPI {
    private provider: JsonRpcProvider
    private paymaster: string;
    private offchainSigner: string;

    constructor(provider: JsonRpcProvider, paymaster: string, offchainSigner: string) {
        super();
        this.paymaster = paymaster;
        this.provider = provider;
        this.offchainSigner = offchainSigner;
    }

    async getPaymasterAndData(userOp: Partial<UserOperationStruct>): Promise<string> {
        const offchainSigner = new ethers.Wallet(this.offchainSigner, this.provider);
        const paymaster = await new VerifyingPaymaster__factory(offchainSigner).attach(this.paymaster)
        try {
            // userOp.preVerificationGas contains a promise that will resolve to an error.
            await ethers.utils.resolveProperties(userOp);
            // eslint-disable-next-line no-empty
        } catch (_) {
        }
        const pmOp: Partial<UserOperationStruct> = {
            sender: userOp.sender,
            nonce: userOp.nonce,
            initCode: userOp.initCode,
            callData: userOp.callData,
            callGasLimit: userOp.callGasLimit,
            verificationGasLimit: userOp.verificationGasLimit,
            maxFeePerGas: userOp.maxFeePerGas,
            maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
            // Dummy values are required here
            paymasterAndData: ethers.utils.hexlify(
                Buffer.alloc(ADDR_SIZE + SIG_SIZE, 1)
            ),
            signature: ethers.utils.hexlify(Buffer.alloc(SIG_SIZE, 1)),
        };
        const op = await ethers.utils.resolveProperties(pmOp);
        op.preVerificationGas = calcPreVerificationGas(op);
        // console.log(`Original UserOperation: ${await printOp(op)}`);
        const hash = await paymaster.getHash(<UserOperationStruct>op)
        const sig = await offchainSigner.signMessage(arrayify(hash))
        return hexConcat([paymaster.address, sig])
    }
}

export const getMyPaymaster = (
    provider: JsonRpcProvider,
    paymaster: string,
    offchainSigner: string
) => new VerifyingPaymasterAPI(provider, paymaster, offchainSigner);
