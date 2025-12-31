import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { useFreighterContext } from "../contexts/FreighterContext";
import { useNotifications } from "../contexts/NotificationContext";
import { formatStellarAddress } from "../lib/utils";

interface ConnectButtonProps {
  variant?: "default" | "launch";
}

const ConnectButton = ({ variant = "default" }: ConnectButtonProps) => {
  const { isConnected, publicKey, isLoading, error, connect, disconnect, isInstalled } = useFreighterContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isConnected && publicKey && location.pathname === "/") {
      addNotification({
        type: 'success',
        title: 'Wallet Connected!',
        message: `Successfully connected to ${formatStellarAddress(publicKey, 'short')}`,
      });
      navigate("/dashboard");
    }
  }, [isConnected, publicKey, navigate, location, addNotification]);

  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: error,
      });
    }
  }, [error, addNotification]);

  if (isConnected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        >
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm hidden sm:inline">{formatStellarAddress(publicKey, 'short')}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-20">
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const buttonText = variant === "launch" ? "Launch App" : "Connect Wallet";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isLoading ? 'Connecting...' : buttonText}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg z-20 p-2">
            {isInstalled ? (
              <button
                onClick={() => {
                  connect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-medium text-sm">Freighter</p>
                  <p className="text-xs text-muted-foreground">Stellar wallet extension</p>
                </div>
              </button>
            ) : (
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <span className="text-2xl">🚀</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">Install Freighter</p>
                  <p className="text-xs text-muted-foreground">Get the Stellar wallet</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectButton;
