import { ChevronDown, ChevronRight, Copy, Eye, RefreshCcw, Send } from 'lucide-react';
import { useState } from 'react';
import './App.css';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { Buffer } from "buffer";
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Keypair, sendAndConfirmTransaction, PublicKey, Transaction, clusterApiUrl, Connection, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

window.Buffer = Buffer

interface wallet {
  address: string;
  privateKey: string;
}

function App() {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [showAddresses, setShowAddresses] = useState<boolean[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<boolean[]>([]);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState({
    position: "",
    balance: "",
    fromAddress: "",
    fromHexPrivateKey: ""
  });

  const genNewMnemonic = () => {
    const words = generateMnemonic(128);
    setMnemonicWords(words.split(" "));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonicWords.join(' '));
    alert('Mnemonic copied to clipboard!');
  };

  const handleClick = () => {
    genNewMnemonic();
    setShowing(true);
  }

  const getSolanaAddressAndPrivateKey = (mnemonic: string) => {
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${wallets.length}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);

    return {
      address: keypair.publicKey.toBase58(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex')
    }
  }

  const getCurrentBalance = async (address: string) => {
    if (address.length === 0) {
      return alert("Please enter address");
    }

    let connection = new Connection(clusterApiUrl("mainnet-beta"));
    const fromPubkey = new PublicKey(address);
    const currentBalance = await connection.getBalance(fromPubkey) / LAMPORTS_PER_SOL;

    console.log(currentBalance, 'SOL');
    setSelectedWallet(selectedWallet => ({ ...selectedWallet, balance: `${currentBalance}` }))
  }

  const sendTransaction = async (fromHexPrivateKey: string, toAddress: string, amount: number) => {
    try {
      let connection = new Connection(clusterApiUrl("mainnet-beta"));
      let transaction = new Transaction();

      const fromSecretKey = Uint8Array.from(Buffer.from(fromHexPrivateKey, 'hex'));
      const fromKeyPair = Keypair.fromSecretKey(fromSecretKey);
      const fromAddress = fromKeyPair.publicKey.toBase58();
      const toPubkey = new PublicKey(toAddress);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromKeyPair.publicKey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      await sendAndConfirmTransaction(connection, transaction, [fromKeyPair]);
      getCurrentBalance(fromAddress);
    } catch (error) {
      console.log(error);
    }
  }

  const generateWallet = async () => {
    try {
      if (!mnemonicWords.length) {
        return;
      }

      const data = getSolanaAddressAndPrivateKey(mnemonicWords.join(" "));

      setWallets(wallets => [...wallets, data])
      setShowAddresses(showAddresses => [...showAddresses, true]);
      setShowPrivateKeys(showPrivateKeys => [...showPrivateKeys, false]);
    } catch (error) {
      console.log(error);
    }
  }

  const toggleVisibility = (index: number, isAddress: boolean) => {
    if (isAddress) {
      setShowAddresses(prev => prev.map((val, i) => i === index ? !val : val));
    } else {
      setShowPrivateKeys(prev => prev.map((val, i) => i === index ? !val : val));
    }
  };

  return (
    <>
      <div className='grid grid-cols-3 p-6 px-10 gap-4 min-h-screen'>
        <div className='col-span-2 flex flex-col gap-y-4 items-center w-full py-4 px-20 border-slate-100/20 border'>
          <div className="flex w-full gap-4">
            <button
              onClick={handleClick}
              className='w-1/2 py-2 px-4 bg-slate-900/40 hover:bg-indigo-500 border-slate-100/20 hover:border-transparent border-2 rounded text-white font-semibold transition'
            >
              Generate Mnemonic
            </button>

            <button
              onClick={generateWallet}
              className='w-1/2 py-2 px-4 bg-slate-900/40 hover:bg-indigo-500 border-slate-100/20 hover:border-transparent border-2 rounded text-white font-semibold transition'
            >
              Generate Wallet
            </button>
          </div>

          {mnemonicWords.length > 0 && (
            <>
              <div className="flex w-full gap-4">
                <button
                  onClick={() => setShowing(showing => !showing)}
                  className='flex justify-center w-1/2 py-2 px-4 bg-slate-900/20 hover:bg-indigo-500 border-slate-100/20 hover:border-transparent border-2 rounded text-white font-semibold transition'
                >
                  {showing ? (<>
                    Hide
                    <ChevronDown className='ml-4 w-6 h-6' />
                  </>
                  ) : (<>
                    Show
                    <ChevronRight className='ml-4 w-6 h-6' />
                  </>)}
                </button>
                <button
                  onClick={copyToClipboard}
                  className='flex justify-center w-1/2 py-2 px-4 bg-slate-900/20 hover:bg-indigo-500 border-slate-100/20 hover:border-transparent border-2 rounded text-white font-semibold transition'
                >
                  Copy
                  <Copy className='ml-4 w-6 h-6' />
                </button>
              </div>

              {showing && <div className='flex flex-row bg-slate-900/50 p-2 justify-center w-full'>
                <div className='flex flex-wrap w-full justify-center gap-2 p-4'>
                  {mnemonicWords.map(word => (
                    <div key={word} className='py-2 px-4 w-[30%] self-start font-semibold bg-slate-700 text-white text-center'>
                      {word}
                    </div>
                  ))}
                </div>
              </div>}
            </>
          )}

          {wallets.length > 0 && (
            <div className='flex flex-col w-full gap-y-4'>
              <div className='mt-4 text-white text-center text-3xl font-semibold'>
                Wallets
              </div>

              <div className='flex flex-col gap-y-2 bg-slate-900/50 p-2 justify-center w-full'>
                {wallets.map((wallet, index) => (
                  <div className='flex w-full items-center justify-between gap-2 p-2 bg-slate-700 text-zinc-400 h-fit'>
                    <div className='flex flex-col gap-y-1 ml-auto w-full'>
                      <div className='flex items-center justify-between w-full gap-x-2'>
                        <span>Address: </span>
                        <input
                          disabled
                          className='w-full pointer-events-none text-white bg-transparent truncate'
                          type={showAddresses[index] ? "text" : "password"}
                          value={wallet.address}
                        />
                        <div
                          onClick={() => toggleVisibility(index, true)}
                          className='p-1 rounded hover:bg-slate-400/30 hover:text-white cursor-pointer transition'
                        >
                          <Eye className='w-4 h-4' />
                        </div>
                        <div
                          onClick={() => navigator.clipboard.writeText(wallet.address)}
                          className='p-1 rounded hover:bg-slate-400/30 hover:text-white cursor-pointer transition'
                        >
                          <Copy className='w-4 h-4' />
                        </div>
                      </div>
                      <div className='flex items-center justify-between w-full gap-x-2'>
                        <div className='whitespace-nowrap'>Private Key: </div>
                        <input
                          disabled
                          className='w-full pointer-events-none text-white bg-transparent truncate'
                          type={showPrivateKeys[index] ? "text" : "password"}
                          value={wallet.privateKey}
                        />
                        <div className='p-1 rounded hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
                          <Eye
                            onClick={() => toggleVisibility(index, false)}
                            className='w-4 h-4'
                          />
                        </div>
                        <div className='p-1 rounded hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
                          <Copy
                            onClick={() => navigator.clipboard.writeText(wallet.privateKey)}
                            className='w-4 h-4'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='max-h-screen pb-10 sticky top-6'>
          <div className='col-span-1 flex flex-col h-full py-4 border-slate-100/20 border'>
            <div className='text-white text-center text-3xl font-semibold'>
              {parseInt(selectedWallet.position) === -1 || !selectedWallet.fromAddress ? "Unknown Wallet" : `Account ${selectedWallet.position}`}
            </div>

            <div className='flex text-xs justify-center items-center text-zinc-300'>
              <div
                onClick={() => navigator.clipboard.writeText(selectedWallet.fromAddress)}
                className='flex justify-center items-center px-1 cursor-pointer'
              >
                {selectedWallet.fromAddress && <>
                  {selectedWallet.fromAddress.slice(0, 3)} ... {selectedWallet.fromAddress.slice(-3)}
                  <Copy
                    className='ml-2 w-3 h-3'
                  />
                </>}
              </div>
            </div>

            <div className='mt-8 flex justify-center items-center text-2xl text-center py-4 text-white'>
              {selectedWallet.balance} SOL
              <span
                onClick={() => {
                  const fromSecretKey = Uint8Array.from(Buffer.from(selectedWallet.fromHexPrivateKey, 'hex'));
                  const fromKeyPair = Keypair.fromSecretKey(fromSecretKey);
                  const fromAddress = fromKeyPair.publicKey.toBase58();
                  getCurrentBalance(fromAddress)
                }}
                className='ml-2 p-1 text-zinc-300 cursor-pointer'
              >
                <RefreshCcw className='h-3 w-3' />
              </span>
            </div>

            <div className="flex flex-col mt-8 px-10 gap-8">
              <div className='flex justify-center gap-4'>
                <div className='flex flex-col justify-center w-20'>
                  <label className='flex justify-center text-2xl font-semibold text-slate-400' htmlFor="amount">Send</label>
                  <span className='-mt-1 text-center text-xs text-zinc-500'>Amount</span>
                </div>
                <input id='amount' className='p-1 h-fit w-full bg-transparent text-white border-slate-100/20 border-2 rounded outline-none focus:ring-2 focus:ring-slate-200/60' type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
              </div>

              <div className='flex justify-center gap-4'>
                <div className='flex flex-col justify-center w-20'>
                  <label className='flex justify-center text-2xl font-semibold text-slate-400' htmlFor="senderPrivateKey">From</label>
                  <span className='-mt-1 text-center text-xs text-zinc-500'>Sender Private Key (Hex)</span>
                </div>
                <input autoComplete='off' id='senderPrivateKey' className='p-1 h-fit w-full bg-transparent text-white border-slate-100/20 border-2 rounded outline-none focus:ring-2 focus:ring-slate-200/60' type="text" value={selectedWallet.fromHexPrivateKey} onChange={e => setSelectedWallet(selectedWallet => ({
                  ...selectedWallet,
                  fromHexPrivateKey: e.target.value,
                }))} />
              </div>

              <div className='flex justify-center gap-4'>
                <div className='flex flex-col justify-center w-20'>
                  <label className='flex justify-center text-2xl font-semibold text-slate-400' htmlFor="to">To</label>
                  <span className='-mt-1 text-center text-xs text-zinc-500'>Receiver Address</span>
                </div>
                <input autoComplete='off' id='to' className='p-1 h-fit w-full bg-transparent text-white border-slate-100/20 border-2 rounded outline-none focus:ring-2 focus:ring-slate-200/60' type="text" value={toAddress} onChange={e => setToAddress(e.target.value)} />
              </div>
            </div>

            {selectedWallet.balance && <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  sendTransaction(selectedWallet.fromHexPrivateKey, toAddress, amount)
                }}
                className='flex py-2 px-4 bg-indigo-500 hover:bg-indigo-500/80 rounded text-white font-semibold transition'
              >
                Send <Send className='ml-2 h-6 w-6' />
              </button>
            </div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
