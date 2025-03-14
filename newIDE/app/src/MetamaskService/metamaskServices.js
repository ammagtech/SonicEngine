import { BrowserProvider } from 'ethers';

export const checkMetaMaskConnection = async () => {
  if (!window.ethereum) return false;
  
  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error('MetaMask check failed:', error);
    return false;
  }
};

export const connectMetaMask = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return { 
      account: accounts[0],
      provider
    };
  } catch (error) {
    console.error('MetaMask connection failed:', error);
    throw error;
  }
};

export const getProvider = () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  return new BrowserProvider(window.ethereum);
};