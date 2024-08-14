"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const wallets_1 = require("./lib/wallets");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const port = 3000;
app.get("/", (req, res) => {
    return res.json({
        status: "ok",
        message: "POST at /api/generateWallet"
    });
});
app.post("/api/generateWallet", (req, res) => {
    try {
        const { index, mnemonic, coinType } = req.body;
        if (!mnemonic || !coinType || [null, undefined].includes(index)) {
            console.log(mnemonic, coinType, index);
            return res.status(400).json({
                message: "Bad Request"
            });
        }
        let temp;
        if (coinType === "bitcoin") {
            temp = (0, wallets_1.getBitcoinAddressAndPrivateKey)(mnemonic, index);
        }
        else if (coinType === "ethereum") {
            temp = (0, wallets_1.getEthereumAddressAndPrivateKey)();
        }
        else if (coinType === "solana") {
            temp = (0, wallets_1.getSolanaAddressAndPrivateKey)(mnemonic, index);
        }
        return res.json(temp);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
