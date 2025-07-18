import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export function Logo({ className = "", showLink = true }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Fahndung Logo"
        width={32}
        height={32}
        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
      />
      <div className="flex flex-col items-start">
        <span className="text-sm sm:text-lg lg:text-xl font-bold text-foreground leading-tight tracking-tight">FAHNDUNG</span>
        <span className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground leading-tight" style={{ 
          fontStretch: 'expanded',
          fontVariationSettings: '"wdth" 150',
          textJustify: 'inter-word',
          width: '100%',
          display: 'block',
          letterSpacing: '0.15em'
        }}>POLIZEI BW</span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
} 