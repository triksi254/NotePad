import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import NoteTokenABI from "../../artifacts/contracts/Honey.sol/NoteToken.json";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [metamaskConnected, setMetamaskConnected] = useState(false);

  const connectToMetamask = useCallback(async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      setMetamaskConnected(true);
    } catch (error) {
      console.error(error);
      setMetamaskConnected(false);
    }
  }, []);

  const mintNote = useCallback(async () => {
    if (!inputValue) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if the ethers library is available
      if (!ethers || !ethers.utils || !ethers.utils.parseEther) {
        throw new Error("Ethers library not available");
      }

      const notePrice = ethers.utils.parseEther("0.1"); // Note price in ETH (0.1 ETH)
      const addNoteTx = await contract.addNote(inputValue, notePrice);
      await addNoteTx.wait();

      setInputValue("");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [inputValue, contract]);

  const purchaseNote = useCallback(
    async (noteId) => {
      try {
        setLoading(true);
        setError(null);

        const note = notes.find((note) => note.id === noteId);
        if (!note || note.purchased) {
          throw new Error("Note not available for purchase");
        }

        // Convert note.price to BigNumber using ethers.BigNumber.from()
        const notePriceInWei = ethers.BigNumber.from(note.price);

        // Send the correct amount of Ether (notePriceInWei) when calling the purchaseNote function
        const purchaseTx = await contract.purchaseNote(noteId, {
          value: notePriceInWei,
        });
        await purchaseTx.wait();
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [notes, contract]
  );

  useEffect(() => {
    async function initialize() {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = "0x3FeF66D2696Be7E1bff5F193FE4e49A26567CcFb"; // Replace with the actual contract address

          const noteTokenContract = new ethers.Contract(
            contractAddress,
            NoteTokenABI.abi,
            signer
          );

          setContract(noteTokenContract);

          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          setAccount(accounts[0]);

          // Fetch the total number of notes from the contract
          const noteCount = await noteTokenContract.notes.length;

          const notePromises = [];
          for (let i = 0; i < noteCount; i++) {
            notePromises.push(noteTokenContract.getNoteByIndex(i));
          }

          const noteResults = await Promise.all(notePromises);

          const validNotes = noteResults
            .map((note, index) => ({
              id: index,
              text: note[0],
              price: note[1].toString(),
              purchased: note[2],
            }))
            .filter((note) => note.text !== ""); // Filter out notes with empty text

          setNotes(validNotes);
          setMetamaskConnected(true);
        } else {
          console.log("Metamask not found");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to initialize" + " " + error.message);
      }
    }

    initialize();
  }, []);

  return (
    <>
      <div>
        {error && <p>Error: {error}</p>}

        <h1>Your Notes</h1>

        {!metamaskConnected ? (
          <button onClick={connectToMetamask}>Connect to Metamask</button>
        ) : (
          <div>
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button onClick={mintNote}>Mint Note</button>
            </div>

            {loading && <p>Loading...</p>}

            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  {note.text} - {ethers.utils.formatEther(note.price)} ETH
                  {!note.purchased && (
                    <button onClick={() => purchaseNote(note.id)}>
                      Purchase
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <p>
              Connected to {account ? `account ${account}` : "Web3 provider"}
            </p>
            <p>Connected to {contract && `contract ${contract.address}`}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
