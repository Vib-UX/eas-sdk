import { AccessList, Addressable, BaseContract, Block, ContractFactory, MinedTransactionResponse, Signature, TransactionLike, TransactionReceipt, TransactionRequest, TransactionResponseParams } from 'ethers';
export interface TransactionResponse extends TransactionLike<string>, TransactionResponseParams {
    readonly blockNumber: null | number;
    readonly blockHash: null | string;
    readonly index: number;
    readonly hash: string;
    readonly type: number;
    readonly to: null | string;
    readonly from: string;
    readonly nonce: number;
    readonly gasLimit: bigint;
    readonly gasPrice: bigint;
    readonly maxPriorityFeePerGas: null | bigint;
    readonly maxFeePerGas: null | bigint;
    readonly maxFeePerBlobGas: null | bigint;
    readonly data: string;
    readonly value: bigint;
    readonly chainId: bigint;
    readonly signature: Signature;
    readonly accessList: null | AccessList;
    readonly blobVersionedHashes: null | Array<string>;
    toJSON(): any;
    getBlock(): Promise<null | Block>;
    getTransaction(): Promise<null | TransactionResponse>;
    confirmations(): Promise<number>;
    wait(confirms?: number, timeout?: number): Promise<null | TransactionReceipt>;
    isMined(): this is MinedTransactionResponse;
    isLegacy(): this is TransactionResponse & {
        accessList: null;
        maxFeePerGas: null;
        maxPriorityFeePerGas: null;
    };
}
export interface Signer extends Addressable {
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;
    call?: (tx: TransactionRequest) => Promise<string>;
    resolveName?: (name: string) => Promise<null | string>;
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;
}
export declare class Transaction<T> {
    readonly tx: TransactionResponse;
    private readonly waitCallback;
    constructor(tx: TransactionResponse, waitCallback: (receipt: TransactionReceipt) => Promise<T>);
    wait(confirmations?: number): Promise<T>;
}
export declare class Base<C extends BaseContract> {
    contract: C;
    constructor(factory: ContractFactory, address: string, signer?: Signer);
    connect(signer: Signer): this;
    getChainId(): Promise<bigint>;
}
