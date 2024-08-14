"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthereumAddressAndPrivateKey = exports.getSolanaAddressAndPrivateKey = exports.getBitcoinAddressAndPrivateKey = void 0;
const payments_1 = require("bitcoinjs-lib/src/payments");
const ecc = __importStar(require("tiny-secp256k1"));
const bip32_1 = __importDefault(require("bip32"));
const web3_js_1 = require("@solana/web3.js");
const buffer_1 = require("buffer");
const random_js_1 = require("ethereum-cryptography/random.js");
const secp256k1_js_1 = require("ethereum-cryptography/secp256k1.js");
const keccak_js_1 = require("ethereum-cryptography/keccak.js");
const bip39_1 = require("bip39");
const bip32 = (0, bip32_1.default)(ecc);
const getBitcoinAddressAndPrivateKey = (mnemonic, index) => {
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const path = `m/0'/0/${index}`;
    const root = bip32.fromSeed(buffer_1.Buffer.from(seed));
    const node = root.derivePath(path);
    return {
        address: (0, payments_1.p2pkh)({ pubkey: node.publicKey }).address,
        privateKey: node.privateKey.toString('hex'),
    };
};
exports.getBitcoinAddressAndPrivateKey = getBitcoinAddressAndPrivateKey;
const getSolanaAddressAndPrivateKey = (mnemonic, index) => {
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const seedWithIndex = buffer_1.Buffer.concat([buffer_1.Buffer.from([index]), seed]);
    const keypair = web3_js_1.Keypair.fromSeed(seedWithIndex.slice(0, 32));
    return {
        address: keypair.publicKey.toBase58(),
        privateKey: buffer_1.Buffer.from(keypair.secretKey).toString('hex')
    };
};
exports.getSolanaAddressAndPrivateKey = getSolanaAddressAndPrivateKey;
const getEthereumAddressAndPrivateKey = () => {
    const randomBytes = (0, random_js_1.getRandomBytesSync)(32);
    const privateKey = buffer_1.Buffer.from(randomBytes).toString("hex");
    const publicKey = secp256k1_js_1.secp256k1.getPublicKey(privateKey);
    const address = buffer_1.Buffer.from((0, keccak_js_1.keccak256)(publicKey)).toString("hex").slice(-40);
    const finalAddress = "0x" + address;
    return {
        address: finalAddress,
        privateKey: privateKey
    };
};
exports.getEthereumAddressAndPrivateKey = getEthereumAddressAndPrivateKey;
