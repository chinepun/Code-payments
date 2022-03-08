import React, { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import {Token,TOKEN_PROGRAM_ID} from "@solana/spl-token";

// To-do
const CODE_WALLET_ADDRESS = "GkPdSq1LMrJDGHrxdpTntFuhkrjmBm6RyJCSWPGSZg8J";

const App = () =>
{
  const [walletConnected, setWalletConnected]=useState(false);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState();

  const getProvider = async () =>
  {
    console.log("Let's Connect to  Phantom");

    if ("solana" in window)
    {
       const provider = window.solana;
       if (provider.isPhantom)
       {
          return provider;
       }
    }
    else
    {
       window.open("https://www.phantom.app/", "_blank");
    }
  }

  const connectWallet = async () =>
  {
     console.log("Connecting to Phantom");
     if (walletConnected)
     {
        //Disconnect Wallet
        setProvider();
        setWalletConnected(false);
     }
     else
     {
        const userWallet = await getProvider();
        if (userWallet) 
        {
           await userWallet.connect();
           userWallet.on("connect", async () =>
           {
              setProvider(userWallet);
              setWalletConnected(true);
           });
        }
     }
  }

  const transferSol = async () =>
  {

  }

  const transferUSDC = async () => 
  {

  }

  return (
    <div>
      <h1>Let's Pay with SOL and USDC</h1>
        {
          walletConnected?(
          <p>
            <strong>Public Key:</strong> 
            {provider.publicKey.toString()}
          </p>                   
          ):<p>Connect your Wallet to See your Public Key</p>
        }
            <button onClick={connectWallet} disabled={loading}>
               {!walletConnected?"Connect to Phantom":"Disconnect Wallet"}
            </button> 

        {
          walletConnected ? (
            <li>
              Pay In SOL
              <button disabled={loading} onClick={transferSol}>Pay In Solana</button>
            </li> ): <></>
        }

        {
          walletConnected ? (
            <li>
              Pay In USDC
              <button disabled={loading} onClick={transferUSDC}>Pay In USDC</button>
            </li> ): <></>
        }
    </div>
  )
}

export default App;
