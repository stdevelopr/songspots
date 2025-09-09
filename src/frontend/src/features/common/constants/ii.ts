// Shared Internet Identity URL resolution for local vs mainnet
// Uses Vite-provided envs via vite-plugin-environment

export function getInternetIdentityUrl(): string {
  const network = (process.env.DFX_NETWORK || import.meta.env.DFX_NETWORK || '').toString();

  if (network === 'ic' || process.env.NODE_ENV === 'production') {
    return 'https://id.ai';
  }

  const canisterId = (process.env.CANISTER_ID_INTERNET_IDENTITY || import.meta.env.CANISTER_ID_INTERNET_IDENTITY || '').toString();
  if (!canisterId) {
    // Fallback to the default local II canister if env not set
    // Common default for local dev per dfx docs
    return 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943';
  }
  return `http://${canisterId}.localhost:4943`;
}

