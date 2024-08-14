import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useState } from 'react';
import './App.css';
import { generateMnemonic } from 'bip39';

function App() {
  const [coinType, setCoinType] = useState<string>("bitcoin");
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);

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

  return (
    <>
      <div className='flex p-6 pt-20 px-10'>
        <div className='flex flex-col space-y-4 items-center w-full p-20 bg-slate-700'>
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
                onChange={(e) => {
                  setCoinType(e.target.value)
                  console.log(e.target.value);
                }}>
                <option value="bitcoin">Bitcoin</option>
                <option value="etherium">Ethereum</option>
                <option value="solana">Solana</option>
              </select>
              <button
                className='w-full py-2 px-4 bg-purple-700 text-white font-semibold hover:opacity-80 transition'
              >
                Generate Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
