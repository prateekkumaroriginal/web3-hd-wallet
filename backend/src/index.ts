import express, { Request, Response } from "express";
import cors from "cors";
import { getBitcoinAddressAndPrivateKey, getEthereumAddressAndPrivateKey, getSolanaAddressAndPrivateKey } from "./lib/wallets";

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

app.get("/", (req, res) => {
    return res.json({
        status: "ok",
        message: "POST at /api/generateWallet"
    })
})

app.post("/api/generateWallet", (req: Request, res: Response) => {
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
            temp = getBitcoinAddressAndPrivateKey(mnemonic, index);
        } else if (coinType === "ethereum") {
            temp = getEthereumAddressAndPrivateKey();
        } else if (coinType === "solana") {
            temp = getSolanaAddressAndPrivateKey(mnemonic, index);
        }

        return res.json(temp);
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})