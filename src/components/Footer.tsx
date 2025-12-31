import { Github, Linkedin, ExternalLink, HelpCircle } from "lucide-react";
import { useNetwork } from "../contexts/NetworkContext";
import { useTutorial } from "../contexts/TutorialContext";

interface FooterProps {
  showTutorial?: boolean;
}

export function Footer({ showTutorial = true }: FooterProps) {
  const { config } = useNetwork();
  const { openTutorial } = useTutorial();

  return (
    <footer className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © 2025 MultiSig Store @{" "}
          <a
            href="https://github.com/olivmath"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            olivmath
          </a>
          {" "}- Powered by Stellar/Soroban
        </p>
        <div className="flex items-center gap-4">
          {showTutorial && (
            <button
              data-tour="tutorial-button"
              onClick={openTutorial}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              title="View Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tutorial</span>
            </button>
          )}
          <a
            href={config.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Explorer</span>
          </a>
          <a
            href="https://www.linkedin.com/in/olivmath/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a
            href="https://github.com/olivmath/multisig-store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
