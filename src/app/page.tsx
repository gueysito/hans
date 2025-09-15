import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col items-center justify-center p-8 relative">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-gold bg-clip-text text-transparent">
          Hans
        </h1>
        <p className="text-xl text-foreground/80">
          The NFT Oracle
        </p>
        <p className="text-lg text-foreground/60 leading-relaxed">
          Peer into the mystical depths of your NFT collection and discover the hidden meanings, 
          ancient energies, and cosmic connections that bind your digital treasures.
        </p>
        
        <div className="space-y-6 pt-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/oracle"
              className="p-6 rounded-lg border border-mystical-purple/30 mystical-glow hover:border-mystical-gold/50 transition-all group"
            >
              <h3 className="text-lg font-semibold mb-2 text-mystical-purple group-hover:text-mystical-gold transition-colors">
                🔮 Oracle Chamber
              </h3>
              <p className="text-sm text-foreground/70">
                Connect your wallet and receive mystical insights about your NFT collection
              </p>
            </Link>
            
            <Link
              href="/community"
              className="p-6 rounded-lg border border-mystical-purple/30 mystical-glow hover:border-mystical-gold/50 transition-all group"
            >
              <h3 className="text-lg font-semibold mb-2 text-mystical-purple group-hover:text-mystical-gold transition-colors">
                🌌 Cosmic Community
              </h3>
              <p className="text-sm text-foreground/70">
                Share wisdom and discover insights from fellow digital souls
              </p>
            </Link>
            
            <Link
              href="/profile"
              className="p-6 rounded-lg border border-mystical-purple/30 mystical-glow hover:border-mystical-gold/50 transition-all group"
            >
              <h3 className="text-lg font-semibold mb-2 text-mystical-purple group-hover:text-mystical-gold transition-colors">
                👤 Sacred Profile
              </h3>
              <p className="text-sm text-foreground/70">
                Manage your mystical identity and saved insights
              </p>
            </Link>
          </div>
          
          <div className="text-sm text-foreground/50 pt-4">
            <p>✨ Hans Oracle - Story 010 Complete ✨</p>
            <p>Production ready • AI predictions • Voice oracle • Premium tiers</p>
          </div>
        </div>
      </div>
    </main>
  );
}
