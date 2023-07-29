import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ContractArtifact from "../../artifacts/contracts/Lock.sol/Lock.json";

function MyApp({ Component, pageProps }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The network url for Mara testnet
  const maraTestnetUrl = "https://testapi.mara.xyz/http";

  // Our deployed contract address
  const contractAddress = "0x3FeF66D2696Be7E1bff5F193FE4e49A26567CcFb";

  useEffect(() => {
    async function initialize() {
      try {
        // Check if the ethers library is available
        if (!ethers || !ethers.providers || !ethers.providers.JsonRpcProvider) {
          throw new Error("Ethers library not available");
        }

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
          setError("Network url is not available");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to initialize" + error.message);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Component
      {...pageProps}
      provider={provider}
      signer={signer}
      contract={contract}
    />
  );
}

export default MyApp;
