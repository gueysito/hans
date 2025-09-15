import ServerInner from "./inner";
import Link from "next/link";

export default function ServerPage() {
  return (
    <main className="min-h-screen p-8 flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-mystical-purple hover:text-mystical-gold transition-colors">
          ← Back to Hans Oracle
        </Link>
      </div>
      
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-mystical-purple to-mystical-gold bg-clip-text text-transparent">
        Server Components
      </h1>
      
      <ServerInner />
      
      <div className="text-center text-sm text-foreground/50">
        <p>Server-side rendering ready for Hans Oracle functionality</p>
      </div>
    </main>
  );
}
