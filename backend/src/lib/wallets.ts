import { p2pkh } from "bitcoinjs-lib/src/payments";
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import { Keypair } from "@solana/web3.js";
import { Buffer } from "buffer";
import { getRandomBytesSync } from "ethereum-cryptography/random.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { mnemonicToSeedSync } from "bip39";

const bip32 = BIP32Factory(ecc);

export const getBitcoinAddressAndPrivateKey = (mnemonic: string, index: number) => {
    const seed = mnemonicToSeedSync(mnemonic)
    const path = `m/0'/0/${index}`;
    const root = bip32.fromSeed(Buffer.from(seed));
    const node = root.derivePath(path);

    return {
        address: p2pkh({ pubkey: node.publicKey }).address!,
        privateKey: node.privateKey!.toString('hex'),
    };
}

export const getSolanaAddressAndPrivateKey = (mnemonic: string, index: number) => {
    const seed = mnemonicToSeedSync(mnemonic)
    const seedWithIndex = Buffer.concat([Buffer.from([index]), seed]);
    const keypair = Keypair.fromSeed(seedWithIndex.slice(0, 32));

    return {
        address: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex')
    }
}

export const getEthereumAddressAndPrivateKey = () => {
    const randomBytes = getRandomBytesSync(32);
    const privateKey = Buffer.from(randomBytes).toString("hex");
    console.log("Private Key: ", privateKey);

    const publicKey = secp256k1.getPublicKey(privateKey);
    console.log("publicKey", publicKey);
    const address = Buffer.from(keccak256(publicKey)).toString("hex");
    console.log("address", address);
    const finalAddress = address.slice(-40);
    console.log("0x" + finalAddress);
    // console.log("Address: ", address);
}