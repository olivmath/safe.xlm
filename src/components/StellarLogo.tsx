interface StellarLogoProps {
  className?: string;
  size?: number;
}

export function StellarLogo({ className = "", size = 16 }: StellarLogoProps) {
  return (
    <img
      src="/stellar.png"
      alt="Stellar"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
