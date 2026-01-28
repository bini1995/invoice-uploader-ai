// import Web3 from 'web3';
const Web3 = null; // Stubbed for now to avoid dependency hell
import crypto from 'crypto';

const NETWORK_LABEL = process.env.BLOCKCHAIN_NETWORK || 'polygon';

function getBlockchainConfig() {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const auditAddress = process.env.BLOCKCHAIN_AUDIT_ADDRESS;
  const chainId = process.env.BLOCKCHAIN_CHAIN_ID ? Number(process.env.BLOCKCHAIN_CHAIN_ID) : undefined;

  if (!rpcUrl || !privateKey) {
    return null;
  }

  return {
    rpcUrl,
    privateKey,
    auditAddress,
    chainId,
    network: NETWORK_LABEL,
  };
}

function createWeb3(rpcUrl) {
  return new Web3(rpcUrl);
}

function sha256Hex(payload) {
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function computeAuditHash(payload) {
  const normalized = JSON.stringify(payload);
  return sha256Hex(normalized);
}

async function storeHashOnChain(hash) {
  const config = getBlockchainConfig();
  if (!config) {
    return { txHash: null, network: null, skipped: true };
  }

  const web3 = createWeb3(config.rpcUrl);
  const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
  web3.eth.accounts.wallet.add(account);

  const toAddress = config.auditAddress || account.address;
  const data = `0x${hash}`;

  const gasPrice = await web3.eth.getGasPrice();
  const tx = {
    from: account.address,
    to: toAddress,
    value: '0x0',
    data,
    gas: 50000,
    gasPrice,
    chainId: config.chainId,
  };

  const signed = await account.signTransaction(tx);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  return { txHash: receipt.transactionHash, network: config.network, skipped: false };
}

async function verifyHashOnChain(hash, txHash) {
  const config = getBlockchainConfig();
  if (!config || !txHash) {
    return { verified: null, reason: 'missing_config_or_tx' };
  }
  const web3 = createWeb3(config.rpcUrl);
  const tx = await web3.eth.getTransaction(txHash);
  if (!tx || !tx.input) {
    return { verified: false, reason: 'missing_transaction' };
  }
  const input = tx.input.toLowerCase();
  const normalizedHash = `0x${hash}`.toLowerCase();
  return { verified: input === normalizedHash, reason: 'checked' };
}

export {
  computeAuditHash,
  storeHashOnChain,
  verifyHashOnChain,
  getBlockchainConfig,
  NETWORK_LABEL,
};
