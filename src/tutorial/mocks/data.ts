export const DEMO_USER = {
  address: "GDEMO742D35CC6634C0532925A3B844BC9E7595F8FE00",
  balance: "100000000000", // 10 XLM in stroops
};

export const DEMO_OWNERS = [
  "GDEMO742D35CC6634C0532925A3B844BC9E7595F8FE00", // Demo user
  "GDEMO8BA1F109551BD432803012645AC136DDD64DBA72",
  "GDEMOABC123DEF456789012345678901234567890ABCD",
];

// Start with empty wallets - wallet is added during tutorial
export const DEMO_WALLETS: Array<{
  contractId: string;
  owners: string[];
  required: number;
  balance: string;
  txCount: number;
}> = [];

// Single transaction shown on wallet page
export const DEMO_TRANSACTIONS = [
  {
    id: 0,
    txType: "xlm" as const,
    to: "GDEMORECIPIENT11111111111111111111111111111111111111",
    amount: "5000000000", // 0.5 XLM
    executed: false,
    confirmations: [DEMO_OWNERS[1]],
  },
];

export const DEMO_NEW_WALLET = {
  contractId: "CDEMOMULTISIG22222222222222222222222222222222222222",
  owners: DEMO_OWNERS,
  required: 2,
  balance: "55000000000", // 5.5 XLM
  txCount: 1,
};

export const DEMO_NEW_TRANSACTION = {
  id: 0,
  txType: "xlm" as const,
  to: "GDEMORECIPIENTNEW111111111111111111111111111111111111",
  amount: "1000000000", // 0.1 XLM
  executed: false,
  confirmations: [DEMO_USER.address],
};
