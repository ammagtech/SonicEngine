import { useState, useEffect } from 'react';
import { checkMetaMaskConnection, connectMetaMask } from '../MetamaskService/metamaskServices';
import { useWallet } from '@solana/wallet-adapter-react';

export const useMetaMask = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const { connect, disconnect, connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("authKey", publicKey.toString());
    } else {
      localStorage.removeItem("authKey");
    }
  }, [connected, publicKey]);
  // useEffect(() => {

  //   const handleDisconnect = () => {
  //     setIsConnected(false);
  //     setAccount(null);
  //     localStorage.removeItem('walletConnected');
  //     localStorage.removeItem('walletAddress');
  //     window.location.reload();
  //   };
  //   // const checkConnection = async () => {
  //   //   const connected = await checkMetaMaskConnection();
  //   //   if (connected) {
  //   //     const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  //   //     setAccount(accounts[0]);
  //   //   }
  //   //   setIsConnected(connected);
  //   // };

  //   // checkConnection();

  //   // if (window.ethereum) {
  //   //   window.ethereum.on('accountsChanged', (accounts) => {
  //   //     if (accounts.length === 0) {
  //   //       handleDisconnect();
  //   //     } else {
  //   //       setAccount(accounts[0]);
  //   //       setIsConnected(true);
  //   //     }
  //   //   });
  //   // }

  //   // return () => {
  //   //   if (window.ethereum) {
  //   //     window.ethereum.removeListener('accountsChanged', () => {});
  //   //   }
  //   // };
  // }, []);

  // const connect = async () => {
  //   try {
  //     const { account: newAccount } = await connectMetaMask();
  //     setIsConnected(true);
  //     setAccount(newAccount);
  //   } catch (error) {
  //     console.error('Connection failed:', error);
  //   }
  // };

  // const disconnect = () => {
  //   setIsConnected(false);
  //   setAccount(null);
  //   localStorage.removeItem('walletConnected');
  //   localStorage.removeItem('walletAddress');
  // };

  return { connect, disconnect, connected, publicKey };
  // return { isConnected, account, connect, disconnect };
};