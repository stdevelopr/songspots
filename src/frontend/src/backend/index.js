import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./backend.did.js";
export { idlFactory } from "./backend.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId =
  process.env.CANISTER_ID_BACKEND;

export const createActor = async (canisterId, options = {}) => {
  const agentOptions = {
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
    ...options.agentOptions
  };
  
  const agent = options.agent || new HttpAgent(agentOptions);

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== "ic") {
    try {
      await agent.fetchRootKey();
      console.log("Root key fetched successfully");
    } catch (err) {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
      throw err;
    }
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

// Create backend actor lazily when needed
export const backend = undefined;
