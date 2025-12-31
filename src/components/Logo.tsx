interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ showTagline = false, size = "md" }: LogoProps) => {
  const imgSize = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Safe.xlm"
        className={`${imgSize[size]} object-contain`}
      />
      <div className="flex flex-col">
        <span className={`${textSize[size]} font-semibold tracking-tight`}>
          Safe<span className="text-primary">.xlm</span>
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground">
            Collective Security on Stellar
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
