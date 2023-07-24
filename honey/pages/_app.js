import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import ContractArtifact from "../../artifacts/contracts/Lock.sol/Lock.json";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "@/utils/getLibrary";

function MyApp({ Component, pageProps }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // The network url for Mara testnet
  const maraTestnetUrl = "https://testapi.mara.xyz/http";

  // Our deployed contract address
  const contractAddress = "0x03E08e2Bcf5189Aa8Cabc1d941E77100f6320e99";

  useEffect(() => {
    if (maraTestnetUrl) {
      const provider = new ethers.providers.JsonRpcProvider(maraTestnetUrl);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ContractArtifact.abi,
        signer
      );
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
    } else {
      console.log("Network url is not available");
    }
  }, []);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default MyApp;
