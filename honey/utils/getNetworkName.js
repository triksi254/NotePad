export function getNetworkName(chainId) {
  switch (chainId) {
    case 80001:
      return "Matic Mumbai";
    case 137:
      return "Matic Mainnet";
    case 43113:
      return "Avalanche Fuji";
    case 43114:
      return "Avalanche Mainnet";
    case 1666700000:
      return "Harmony Testnet";
    case 1666600000:
      return "Harmony Mainnet";
    case 128:
      return "Huobi Eco Chain Mainnet";
    case 256:
      return "Huobi Eco Chain Testnet";
    case 97:
      return "Binance Smart Chain Testnet";
    case 56:
      return "Binance Smart Chain Mainnet";
    case 3:
      return "Ropsten Testnet";
    case 4:
      return "Rinkeby Testnet";
    case 5:
      return "Goerli Testnet";
    case 42:
      return "Kovan Testnet";
    default:
      return `Unknown chain (${chainId})`;
  }
}
