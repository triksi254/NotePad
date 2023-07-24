import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { TodoListABI } from "../utils/TodoListABI";
import { getNetworkName } from "../utils/getNetworkName";

export default function Home() {
  const [tasks, setTasks] = useState([BreakFast]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const createTask = useCallback(async () => {
    if (!inputValue) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const createTaskTx = await contract.createTask(inputValue);
      await createTaskTx.wait();

      setInputValue("");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [inputValue, contract]);

  const completeTask = useCallback(
    async (taskId) => {
      try {
        setLoading(true);
        setError(null);

        const completeTaskTx = await contract.completeTask(taskId);
        await completeTaskTx.wait();
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  useEffect(() => {
    async function initialize() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();
        const networkName = getNetworkName(network.chainId);

        const todoListContract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          TodoListABI,
          signer
        );

        setContract(todoListContract);

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAccount(accounts[0]);

        todoListContract.on("TaskCreated", (task) => {
          setTasks((prevTasks) => [...prevTasks, task]);
        });

        todoListContract.on("TaskCompleted", (taskId) => {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? { ...task, completed: true } : task
            )
          );
        });

        const taskCount = await todoListContract.taskCount();
        const taskPromises = [];

        for (let i = 1; i <= taskCount; i++) {
          taskPromises.push(todoListContract.tasks(i));
        }

        const taskResults = await Promise.all(taskPromises);

        const tasks = taskResults.map((task) => ({
          id: task.id.toNumber(),
          content: task.content,
          completed: task.completed,
        }));

        setTasks(tasks);
      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    }

    initialize();
  }, []);

  return (
    <div>
      {error && <p>Error: {error}</p>}

      <h1>Your Notes</h1>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={createTask}>Add Task</button>
      </div>

      {loading && <p>Loading...</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => completeTask(task.id)}
            />
            {task.content}
          </li>
        ))}
      </ul>

      <p>Connected to {account ? `account ${account}` : "Web3 provider"}</p>
      <p>Connected to {contract && `contract ${contract.address}`}</p>
      <p>
        Connected to{" "}
        {contract &&
          `network ${getNetworkName(contract.provider.network.chainId)}`}
      </p>
    </div>
  );
}
