import { keccak256 } from "@ethersproject/keccak256";
import { Wallet, verifyMessage } from "@ethersproject/wallet";
import { toUtf8Bytes } from "@ethersproject/strings";
import { splitSignature, joinSignature } from "@ethersproject/bytes";

import {
  Proxy,
  Signature,
  ATTEST_TYPED_SIGNATURE,
  REVOKE_TYPED_SIGNATURE,
  ATTEST_PRIMARY_TYPE,
  REVOKE_PRIMARY_TYPE,
  DOMAIN_TYPE,
  ATTEST_TYPE,
  REVOKE_TYPE
} from "../src/proxy";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("type hashes", () => {
  it("should have matching ATTEST_TYPE to the contract's ATTEST_TYPEHASH", () => {
    expect(keccak256(toUtf8Bytes(ATTEST_TYPED_SIGNATURE))).toEqual(
      "0x65c1f6a23cba082e11808f5810768554fa9dfba7aa5f718980214483e87e1031"
    );
  });

  it("should have matching REVOKE_TYPE to the contract's REVOKE_TYPEHASH", () => {
    expect(keccak256(toUtf8Bytes(REVOKE_TYPED_SIGNATURE))).toEqual(
      "0x75d496468bcca1c327d9bccd1482359dcf755ab9af99c9a010c7a787c747c385"
    );
  });
});

describe("attest", () => {
  let proxy: Proxy;

  beforeEach(() => {
    proxy = new Proxy({ address: "0xa533e32144b5be3f76446f47696bbe0764d5339b", version: "0.1", chainId: 1 });
  });

  it("should create a proper EIP712 attestation request", async () => {
    const params = {
      recipient: ZERO_ADDRESS,
      ao: 123,
      expirationTime: 100000,
      refUUID: ZERO_BYTES32,
      data: Buffer.alloc(0),
      nonce: 0
    };

    const wallet = Wallet.createRandom();
    const request = await proxy.getAttestationRequest(params, async (message: Buffer) => {
      const { v, r, s } = splitSignature(await wallet.signMessage(message));
      return { v, r, s };
    });

    expect(
      await proxy.verifyAttestationRequest(
        await wallet.getAddress(),
        request,
        async (message: Buffer, signature: Signature) => {
          const sig = joinSignature(signature);
          return verifyMessage(message, sig);
        }
      )
    ).toBeTruthy();
  });

  it("should return proper EIP712 attestation typed data ", async () => {
    const params = {
      recipient: ZERO_ADDRESS,
      ao: 567,
      expirationTime: 111,
      refUUID: ZERO_BYTES32,
      data: Buffer.alloc(0),
      nonce: 100
    };

    expect(proxy.getAttestationTypedData(params)).toEqual({
      domain: proxy.getDomainTypedData(),
      primaryType: ATTEST_PRIMARY_TYPE,
      message: params,
      types: {
        EIP712Domain: DOMAIN_TYPE,
        Attest: ATTEST_TYPE
      }
    });
  });

  it("should create a proper EIP712 revocation request", async () => {
    const params = {
      uuid: ZERO_BYTES32,
      nonce: 0
    };

    const wallet = Wallet.createRandom();
    const request = await proxy.getRevocationRequest(params, async (message: Buffer) => {
      const { v, r, s } = splitSignature(await wallet.signMessage(message));
      return { v, r, s };
    });

    expect(
      await proxy.verifyRevocationRequest(
        await wallet.getAddress(),
        request,
        async (message: Buffer, signature: Signature) => {
          const sig = joinSignature(signature);
          return verifyMessage(message, sig);
        }
      )
    ).toBeTruthy();
  });

  it("should return proper EIP712 revocation typed data ", async () => {
    const params = {
      uuid: ZERO_BYTES32,
      nonce: 1000
    };

    expect(proxy.getRevocationTypedData(params)).toEqual({
      domain: proxy.getDomainTypedData(),
      primaryType: REVOKE_PRIMARY_TYPE,
      message: params,
      types: {
        EIP712Domain: DOMAIN_TYPE,
        Revoke: REVOKE_TYPE
      }
    });
  });
});
