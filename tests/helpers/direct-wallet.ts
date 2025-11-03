/**
 * Direct Blockchain Helper using ethers.js
 * 
 * Bypasses MetaMask UI by signing transactions directly with private key.
 * More reliable for automated testing.
 */

import { ethers } from 'ethers';

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;

/**
 * Initialize provider and signer
 */
export async function initializeDirectWallet() {
  const privateKey = process.env.METAMASK_PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || 'https://rpc.galachain.com'; // Update with actual GalaChain RPC
  
  if (!privateKey) {
    throw new Error('METAMASK_PRIVATE_KEY not found in environment');
  }

  // Add 0x prefix if not present
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  // Create provider
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Create wallet signer
  signer = new ethers.Wallet(formattedKey, provider);
  
  console.log('[DIRECT] Wallet initialized:', await signer.getAddress());
  console.log('[DIRECT] Network:', (await provider.getNetwork()).name);
  
  return { provider, signer };
}

/**
 * Get current signer (initialize if needed)
 */
export async function getSigner() {
  if (!signer) {
    await initializeDirectWallet();
  }
  return signer!;
}

/**
 * Get current provider
 */
export async function getProvider() {
  if (!provider) {
    await initializeDirectWallet();
  }
  return provider!;
}

/**
 * Get wallet address
 */
export async function getWalletAddress() {
  const wallet = await getSigner();
  return await wallet.getAddress();
}

/**
 * Get GALA balance directly from blockchain
 */
export async function getGalaBalanceDirect() {
  const wallet = await getSigner();
  const balance = await wallet.provider!.getBalance(wallet.address);
  const balanceInGala = ethers.formatEther(balance);
  
  console.log(`[DIRECT] GALA Balance: ${balanceInGala} GALA`);
  return balanceInGala;
}

/**
 * Send a transaction directly (bypassing MetaMask UI)
 */
export async function sendTransaction(tx: ethers.TransactionRequest) {
  const wallet = await getSigner();
  
  console.log('[DIRECT] Preparing transaction...');
  console.log('[DIRECT] To:', tx.to);
  console.log('[DIRECT] Value:', tx.value ? ethers.formatEther(tx.value) : '0');
  
  // Send transaction
  const transaction = await wallet.sendTransaction(tx);
  console.log('[DIRECT] Transaction sent:', transaction.hash);
  
  // Wait for confirmation
  console.log('[DIRECT] Waiting for confirmation...');
  const receipt = await transaction.wait();
  console.log('[DIRECT] ✅ Transaction confirmed in block:', receipt!.blockNumber);
  
  return receipt;
}

/**
 * Call a smart contract method (read-only)
 */
export async function callContract(
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[] = []
) {
  const prov = await getProvider();
  const contract = new ethers.Contract(contractAddress, abi, prov);
  
  console.log(`[DIRECT] Calling ${method}...`);
  const result = await contract[method](...params);
  console.log(`[DIRECT] Result:`, result);
  
  return result;
}

/**
 * Execute a smart contract method (write operation)
 */
export async function executeContract(
  contractAddress: string,
  abi: any[],
  method: string,
  params: any[] = [],
  value?: bigint
) {
  const wallet = await getSigner();
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  console.log(`[DIRECT] Executing ${method}...`);
  console.log(`[DIRECT] Params:`, params);
  if (value) console.log(`[DIRECT] Value: ${ethers.formatEther(value)} GALA`);
  
  // Execute transaction
  const tx = await contract[method](...params, value ? { value } : {});
  console.log('[DIRECT] Transaction sent:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('[DIRECT] ✅ Transaction confirmed in block:', receipt.blockNumber);
  
  return receipt;
}

/**
 * Sign a message directly
 */
export async function signMessage(message: string) {
  const wallet = await getSigner();
  const signature = await wallet.signMessage(message);
  
  console.log('[DIRECT] Message signed');
  console.log('[DIRECT] Signature:', signature);
  
  return signature;
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(tx: ethers.TransactionRequest) {
  const prov = await getProvider();
  const gasEstimate = await prov.estimateGas(tx);
  const gasPrice = (await prov.getFeeData()).gasPrice;
  
  const estimatedCost = gasEstimate * gasPrice!;
  
  console.log('[DIRECT] Gas estimate:', gasEstimate.toString());
  console.log('[DIRECT] Gas price:', ethers.formatUnits(gasPrice!, 'gwei'), 'gwei');
  console.log('[DIRECT] Estimated cost:', ethers.formatEther(estimatedCost), 'GALA');
  
  return {
    gasLimit: gasEstimate,
    gasPrice,
    totalCost: estimatedCost
  };
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(txHash: string) {
  const prov = await getProvider();
  const receipt = await prov.getTransactionReceipt(txHash);
  
  if (receipt) {
    console.log('[DIRECT] Transaction status:', receipt.status === 1 ? 'Success' : 'Failed');
    console.log('[DIRECT] Block number:', receipt.blockNumber);
    console.log('[DIRECT] Gas used:', receipt.gasUsed.toString());
  } else {
    console.log('[DIRECT] Transaction not yet mined');
  }
  
  return receipt;
}

/**
 * Wait for transaction to be mined
 */
export async function waitForTransaction(txHash: string, confirmations: number = 1) {
  const prov = await getProvider();
  
  console.log(`[DIRECT] Waiting for ${confirmations} confirmation(s)...`);
  const receipt = await prov.waitForTransaction(txHash, confirmations);
  
  if (receipt) {
    console.log('[DIRECT] ✅ Transaction confirmed');
    return receipt;
  }
  
  throw new Error('Transaction failed or was not found');
}

/**
 * Get nonce for wallet
 */
export async function getNonce() {
  const wallet = await getSigner();
  const nonce = await wallet.getNonce();
  
  console.log('[DIRECT] Current nonce:', nonce);
  return nonce;
}

/**
 * Cleanup
 */
export function cleanup() {
  provider = null;
  signer = null;
  console.log('[DIRECT] Wallet cleaned up');
}

