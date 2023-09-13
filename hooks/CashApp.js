import { useState,useEffect } from "react";
import { getAvatarUrl } from "../functions/getAvatarUrl";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {useConnection,useWallet} from "@solana/wallet-adapter-react";
import {clusterApiUrl,Connection,Keypair,LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction} from "@solana/web3.js";
import {BigNumber} from "bignumber.js";

export const useCashApp=()=>{


    //Custome Hook for localStorage
    const useLocalStorage=(storageKey,fallbackState)=>{
        const [value,setValue]=useState(
            JSON.parse(localStorage.getItem(storageKey))??fallbackState
        );
        useEffect(()=>{
            localStorage.setItem(storageKey,JSON.stringify(value))
        },[value,storageKey]);
        return [value,setValue];
    }

    const [userAddress,setUserAddress]=useState("Connect");//11111111111111111111111111111111
    const [avatar,setAvatar]=useState("");
    const [amount,setAmount]=useState();
    const [receiver,setReceiver]=useState("");
    const [transactionPurpose,setTransactionPurpose]=useState("");
    // to store all the transactions
    const [transactions,setTransactions]=useLocalStorage("transaction",[]);
    const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
    const [publicKeySet,setPublicKeySet]=useState(false);

    const {connected,publicKey,sendTransaction}=useWallet();
    const {connection}=useConnection();



    useEffect(()=>{
        if(connected)
        {
            // Get Avatar based on the userAddress
            setAvatar(getAvatarUrl(publicKey.toString()));
            setUserAddress(publicKey.toString());
            setPublicKeySet(true);
        }
    },[connected]);


    // Create transaction to make a transaction
    const makeTransaction=async (fromWallet,toWallet,amount,reference)=>{
        const network=WalletAdapterNetwork.Devnet;
        const endpoint=clusterApiUrl(network);
        const connection=new Connection(endpoint);

        const {blockhash}=await connection.getLatestBlockhash('finalized');

        const transaction =new Transaction({
            recentBlockhash:blockhash,
            // Who pays the fees(buyer)
            feePayer:fromWallet
        })
        // create an instruction to send sol from one wallet to an other wallet and we can sign it from there
        const transferInstruction=SystemProgram.transfer({
            fromPubkey: fromWallet,
            lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: toWallet
        });
        transferInstruction.keys.push({
            pubkey:reference,
            isSigner:false,
            isWritable:false
        });
        transaction.add(transferInstruction);
        return transaction;
    }

    // create a function to run the transaction this will be triggered by the button
    const doTransaction=async (amount,reciever,transactionPurpose)=>{
        const fromWallet=publicKey;
        const toWallet=new PublicKey(reciever);
        const bnAmount=new BigNumber(amount);
        const reference=Keypair.generate().publicKey;
        const transaction=await makeTransaction(fromWallet,toWallet,bnAmount,reference);
        const txnHash=await sendTransaction(transaction,connection);
        console.log(txnHash);

        // for storing the transaction value in the localStorage
        const newId=(transactions.length+1).toString();
        const newTransaction={
            id:newId,
            from:{
                name:publicKey,
                handle:publicKey,
                avatar:avatar,
                verified:true
            },
            to:{
                name:reciever,
                handle:false,
                avatar:getAvatarUrl(reciever.toString()),
                verified:false
            },
            description: transactionPurpose,
            transactionDate:new Date(),
            status:'Completed',
            amount: amount,
        } 
        setNewTransactionModalOpen(false);
        setTransactions([...transactions,newTransaction]);
    }
        
    return {
        connected,
        publicKeySet,
        publicKey,
        avatar,
        userAddress,
        doTransaction,
        amount,
        setAmount,
        receiver,
        setReceiver,
        transactionPurpose,
        setTransactionPurpose,
        newTransactionModalOpen,
        setNewTransactionModalOpen,
        transactions,
        setTransactions,
    };
}
