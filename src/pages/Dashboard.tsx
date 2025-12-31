import { useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFreighterContext } from "../contexts/FreighterContext";
import { useNotifications } from "../contexts/NotificationContext";
import { Layout } from "../components/Layout";
import WalletCard from "../components/WalletCard";
import { useMockMultiSigFactory } from "../hooks/useMockMultiSig";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { publicKey, isConnected } = useFreighterContext();
  const { wallets, createMultiSig, isCreating, isSuccess, refetchUserMultiSigs } = useMockMultiSigFactory(publicKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  // Form state
  const [owners, setOwners] = useState<string[]>([]);
  const [newOwner, setNewOwner] = useState("");
  const [required, setRequired] = useState(1);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (publicKey && owners.length === 0) {
      setOwners([publicKey]);
    }
  }, [publicKey, owners.length]);

  useEffect(() => {
    if (isSuccess) {
      addNotification({
        type: 'success',
        title: 'Wallet Created',
        message: 'You deployed a new multisig wallet on Soroban.',
      });
      setIsModalOpen(false);
      setOwners(publicKey ? [publicKey] : []);
      setNewOwner("");
      setRequired(1);
      refetchUserMultiSigs();
    }
  }, [isSuccess, refetchUserMultiSigs, addNotification, publicKey]);

  const handleAddOwner = () => {
    console.log("handleAddOwner called, newOwner:", newOwner);

    // Accept any Stellar public key (starts with G) or contract (starts with C)
    const trimmedOwner = newOwner.trim();

    // Skip if empty
    if (!trimmedOwner) {
      console.log("Empty owner, skipping");
      return;
    }

    // Check if already exists
    if (owners.includes(trimmedOwner)) {
      console.log("Owner already exists");
      return;
    }

    // Check prefix
    if (!trimmedOwner.startsWith('G') && !trimmedOwner.startsWith('C')) {
      console.log("Invalid prefix - must start with G or C");
      return;
    }

    // Add the owner
    setOwners(prev => [...prev, trimmedOwner]);
    setNewOwner("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOwner();
    }
  };

  const handleRemoveOwner = (index: number) => {
    if (owners[index] !== publicKey) {
      setOwners(owners.filter((_, i) => i !== index));
    }
  };

  const handleCreateWallet = () => {
    if (owners.length >= required && required > 0) {
      createMultiSig(owners, required);
    }
  };

  return (
    <Layout hasWallets={wallets.length > 0}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Multisig Wallets</h1>
              <p className="text-muted-foreground">
                Manage all your multi-signature wallets on Stellar
              </p>
            </div>
            <button
              data-tour="create-wallet"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create New Wallet
            </button>
          </div>
        </div>

        {/* Wallets Grid */}
        {wallets.length === 0 ? (
          <div data-tour="empty-state" className="flex flex-col items-center justify-center py-16">
            <div className="p-6 rounded-full bg-muted mb-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Wallets Found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first multisig wallet to begin
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create Your First Wallet
            </button>
          </div>
        ) : (
          <div data-tour="wallet-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.contractId}
                contractId={wallet.contractId}
                owners={wallet.owners}
                required={wallet.required}
                txCount={wallet.transactions.length}
                pendingCount={wallet.transactions.filter(tx => !tx.executed).length}
                balance={wallet.balance}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Wallet Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create MultiSig Wallet</DialogTitle>
            <DialogDescription>
              Configure your new multisig wallet on Soroban
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Owners List */}
            <div>
              <Label className="text-sm font-medium">Owners ({owners.length})</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {owners.map((owner, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="font-mono text-xs truncate flex-1">
                      {owner.slice(0, 8)}...{owner.slice(-8)}
                      {owner === publicKey && <span className="ml-2 text-primary">(you)</span>}
                    </span>
                    {owner !== publicKey && (
                      <button
                        onClick={() => handleRemoveOwner(index)}
                        className="ml-2 text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Owner */}
            <div>
              <Label htmlFor="newOwner" className="text-sm font-medium">Add Owner</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="newOwner"
                  placeholder="G... (Stellar public key)"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyPress}
                  className="flex-1 font-mono text-xs"
                />
                <Button type="button" onClick={handleAddOwner} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Required Signatures */}
            <div>
              <Label htmlFor="required" className="text-sm font-medium">
                Required Signatures: {required} of {owners.length}
              </Label>
              <input
                id="required"
                type="range"
                min={1}
                max={Math.max(1, owners.length)}
                value={required}
                onChange={(e) => setRequired(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateWallet}
              disabled={isCreating || owners.length < required || required < 1}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Wallet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
