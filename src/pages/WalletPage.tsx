import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Shield, ArrowLeft, Plus, Send, CheckCircle, Clock } from "lucide-react";
import { useFreighterContext } from "../contexts/FreighterContext";
import { useNotifications } from "../contexts/NotificationContext";
import { Layout } from "../components/Layout";
import { CopyableAddress } from "../components/CopyableAddress";
import Identicon from "../components/Identicon";
import { useMockMultiSig } from "../hooks/useMockMultiSig";
import { formatXLM } from "../lib/utils";
import { StellarLogo } from "../components/StellarLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const WalletPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, publicKey } = useFreighterContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  // Form state
  const [txType, setTxType] = useState<'xlm' | 'token'>('xlm');
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const contractId = id;
  const { owners, required, txCount, transactions, balance, submitXLM, isSubmitting } = useMockMultiSig(contractId);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  const handleSubmit = async () => {
    if (!recipient || !amount) return;

    try {
      if (txType === 'xlm') {
        await submitXLM(recipient, amount);
      }
      addNotification({
        type: 'success',
        title: 'Transaction Submitted!',
        message: 'Your transaction has been submitted and is awaiting confirmations.',
        walletAddress: contractId,
      });
      setIsModalOpen(false);
      setRecipient("");
      setAmount("");
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'Failed to submit transaction. Please try again.',
      });
    }
  };

  if (!contractId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout isWalletPage>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Wallet Header */}
        <div className="mb-8 flex items-center gap-4">
          <Identicon address={contractId} size={56} className="rounded-xl flex-shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Multisig Wallet
            </h1>
            <CopyableAddress address={contractId} className="text-muted-foreground" showIdenticon={false} truncate="long" />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Owners Card */}
          <div data-tour="owners-list" className="rounded-2xl border border-border bg-card p-6 flex flex-col min-h-[200px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold uppercase tracking-wide text-sm">Owners</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {owners.map((owner, index) => (
                <div key={index} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
                  <CopyableAddress address={owner} className="text-sm" identiconSize={28} truncate="short" />
                  {owner === publicKey && <span className="text-xs text-primary">(you)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Required Signatures Card */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col min-h-[200px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold uppercase tracking-wide text-sm">Required Signatures</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-4xl font-bold">
                {required} / {owners.length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Approvals required
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div data-tour="wallet-balance" className="rounded-2xl border border-border bg-card p-6 flex flex-col min-h-[200px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <StellarLogo size={20} />
              </div>
              <h3 className="font-display font-semibold uppercase tracking-wide text-sm">Balance</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-4xl font-bold">
                {formatXLM(balance)} <span className="text-lg text-muted-foreground">XLM</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Available balance
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Transactions</h2>
            <button
              data-tour="create-transaction"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              New Transaction
            </button>
          </div>
          {txCount === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-lg font-medium mb-2">No Transactions</p>
              <p className="text-muted-foreground">This wallet hasn't executed any transactions yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click "New Transaction" above to create your first transaction.</p>
            </div>
          ) : (
            <div data-tour="transactions-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`rounded-2xl border p-4 ${
                    tx.executed
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-yellow-500/30 bg-yellow-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">TX #{tx.id}</span>
                    {tx.executed ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Executed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Send className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-mono text-xs">{tx.to.slice(0, 8)}...{tx.to.slice(-4)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>{' '}
                      <span className="font-semibold">{formatXLM(tx.amount)} XLM</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confirmations:</span>{' '}
                      <span className="font-semibold">{tx.confirmations.length} / {required}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
            <DialogDescription>
              Create a new transaction for this multisig wallet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <Label className="text-sm font-medium">Transaction Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={txType === 'xlm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTxType('xlm')}
                >
                  Send XLM
                </Button>
                <Button
                  variant={txType === 'token' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTxType('token')}
                  disabled
                >
                  Send Token (TODO)
                </Button>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <Label htmlFor="recipient" className="text-sm font-medium">Recipient</Label>
              <Input
                id="recipient"
                placeholder="G... (Stellar public key)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">Amount (XLM)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !recipient || !amount}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default WalletPage;
