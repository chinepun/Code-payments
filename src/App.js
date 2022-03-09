import React, { useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair, Transaction, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';
import {Token,TOKEN_PROGRAM_ID} from "@solana/spl-token";

// To-do
const CODE_WALLET_ADDRESS = "9pSZeZPP18FYy35MkF44rqE2LD6oLc5sMexFGUnULCWW";
const NETWORK = clusterApiUrl("devnet");
const connection = new Connection(
  NETWORK,
  "confirmed"
);
const amountInSol = 0.523;
const USDC_ADDRESS = "CWj62EvNGDb3MJGuijS7orkxwqJ9t5keauN1yAGuyPyT";
const USDC_NO_OF_DECIMALS = 9;
const amountInUSDC = 1.9999999;

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

  // Update Wallet If User Changes Wallet
  useEffect(() => {
    if (provider) {
      provider.on("connect", async () => {
        console.log("wallet got connected", provider.publicKey)
        setProvider(provider.publicKey)

      });
      provider.on("disconnect", () => {
        console.log("Disconnected from wallet");
      });
    }
  }, [provider]);

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

    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey(CODE_WALLET_ADDRESS),
        lamports: amountInSol * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = provider.publicKey;
    console.log("Getting recent blockhash");
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    
    if (transaction) 
    {
      try 
      {
       let signed = await provider.signTransaction(transaction);
        console.log('Got signature, submitting transaction');

       let signature = await connection.sendRawTransaction(signed.serialize());
        console.log('Submitted transaction ' + signature + ', awaiting confirmation');
   
        await connection.confirmTransaction(signature);
        console.log('Transaction ' + signature + ' confirmed');
   
        return { status: true, signature }
   
      }
      catch (e) 
      {
        console.warn(e);
        console.log('Error: ' + e.message);
        return { status: false, error: e.message }
      }
    }
  }



  const transferUSDC = async () => 
  {
    const mintPublicKey = new PublicKey(USDC_ADDRESS); 

    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      provider.publicKey // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
    );

    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      provider.publicKey
    );   

    const toTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      new PublicKey(CODE_WALLET_ADDRESS)
    );

  let transaction = new Transaction().add(
    Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        provider.publicKey,
        [],
        amountInUSDC * ((1 * 10) ** USDC_NO_OF_DECIMALS)
    )
  )

  transaction.feePayer=provider.publicKey;
   let blockhashObj = await connection.getRecentBlockhash();
   console.log("blockhashObj", blockhashObj);
   transaction.recentBlockhash = await blockhashObj.blockhash;

   if (transaction)
   {
      console.log("Txn created successfully");
   }
   
   let signed = await provider.signTransaction(transaction);
   let signature = await connection.sendRawTransaction(signed.serialize());
   await connection.confirmTransaction(signature);
   
   console.log("SIGNATURE: ", signature);
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
