import { ChevronDown, ChevronRight, Copy, Eye } from 'lucide-react';
import { useState } from 'react';
import './App.css';
import { generateMnemonic } from 'bip39';
import { Buffer } from "buffer";
import axios from 'axios';
import { VITE_APP_BACKEND_URL } from './lib/constants';

window.Buffer = Buffer

interface wallet {
  coinType: string;
  address: string;
  privateKey: string;
}

function App() {
  const [coinType, setCoinType] = useState<string>("bitcoin");
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [showAddresses, setShowAddresses] = useState<boolean[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<boolean[]>([]);

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

  const generateWallet = async () => {
    try {
      if (!mnemonicWords || !coinType) {
        return;
      }

      const response = await axios.post(`${VITE_APP_BACKEND_URL}/api/generateWallet`, {
        mnemonic: mnemonicWords.join(" "),
        coinType,
        index: wallets.length
      });
      const data = response.data;

      setWallets(wallets => [...wallets, { ...data, coinType }])
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
      <div className='flex p-6 px-10'>
        <div className='flex flex-col gap-y-4 items-center w-full p-20 bg-slate-700'>
          <button
            onClick={handleClick}
            className='w-full py-2 px-4 bg-purple-700 text-white font-semibold hover:opacity-80 transition'
          >
            Generate Mnemonic
          </button>

          {mnemonicWords.length > 0 && (
            <>
              <div className="flex w-full gap-4">
                <div
                  onClick={() => setShowing(showing => !showing)}
                  className='flex justify-center cursor-pointer font-semibold text-white w-full h-full p-2 bg-slate-500 hover:opacity-80'
                >
                  {showing ? (<>
                    Hide
                    <ChevronDown className='ml-4 w-6 h-6' />
                  </>
                  ) : (<>
                    Show
                    <ChevronRight className='ml-4 w-6 h-6' />
                  </>)}
                </div>
                <div
                  onClick={copyToClipboard}
                  className='flex justify-center cursor-pointer font-semibold text-white w-full h-full p-2 bg-slate-500 hover:opacity-80'
                >
                  Copy
                  <Copy className='ml-4 w-6 h-6' />
                </div>
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

          <div className="flex w-full gap-4">
            <label className='flex text-2xl w-[300px] font-semibold text-slate-400' htmlFor="blockchain">Choose blockchain:</label>
            <div className='flex w-full gap-4'>
              <select
                id='blockchain'
                className='w-full'
                defaultValue="0"
                onChange={(e) => setCoinType(e.target.value)}>
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
              </select>
              <button
                onClick={generateWallet}
                className='w-full py-2 px-4 bg-purple-700 text-white font-semibold hover:opacity-80 transition'
              >
                Generate Wallet
              </button>
            </div>
          </div>

          {wallets.length > 0 && (
            <div className='flex flex-col w-full gap-y-4'>
              <div className='mt-10 text-white text-center text-2xl font-semibold'>
                Wallets
              </div>

              <div className='flex flex-col gap-y-2 bg-slate-900/50 p-2 justify-center w-full'>
                {wallets.map((wallet, index) => (
                  <div className='flex w-full items-center justify-between gap-2 p-2 bg-slate-700 text-zinc-400'>
                    <div className='font-semibold uppercase mr-2'>
                      {wallet.coinType}
                    </div>

                    <div className='flex flex-col gap-y-1 ml-auto w-full'>
                      <div className='flex items-center justify-between w-full gap-x-2'>
                        <span>Address: </span>
                        <input
                          disabled
                          className='w-full pointer-events-none text-white bg-transparent truncate'
                          type={showAddresses[index] ? "text" : "password"}
                          value={wallet.address}
                        />
                        <div className='p-1 hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
                          <Eye
                            onClick={() => toggleVisibility(index, true)}
                            className='w-4 h-4'
                          />
                        </div>
                        <div className='p-1 hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
                          <Copy
                            onClick={() => navigator.clipboard.writeText(wallet.address)}
                            className='w-4 h-4'
                          />
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
                        <div className='p-1 hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
                          <Eye
                            onClick={() => toggleVisibility(index, false)}
                            className='w-4 h-4'
                          />
                        </div>
                        <div className='p-1 hover:bg-slate-400/30 hover:text-white cursor-pointer transition'>
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
      </div>
    </>
  );
}

export default App;
