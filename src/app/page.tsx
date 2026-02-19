"use client";

import Link from "next/link";
import { CosmicBackground } from "@/components/ui/CosmicBackground";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
      {/* Background Layer */}
      <CosmicBackground />
      
      {/* Content Layer */}
      <div className="z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000">
        <h1 className="mb-6 font-orbitron text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-yellow-200 to-accent-gold drop-shadow-[0_0_15px_rgba(226,183,20,0.5)]">
          RESERVATION
          <br />
          SIMULATOR
        </h1>
        
        <div className="mb-12 max-w-2xl space-y-4">
          <p className="font-rajdhani text-xl md:text-2xl text-muted-text leading-relaxed text-glow-blue">
            Step into a satirical sci-fi world where your policy decisions determine the fate of 5 distinct social classes.
          </p>
          <p className="font-rajdhani text-lg text-white/80">
            Will you bridge the gap or widen the divide?
          </p>
        </div>
        
        <Link href="/simulate">
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 shadow-[0_0_30px_rgba(226,183,20,0.3)] animate-pulse hover:animate-none hover:shadow-[0_0_50px_rgba(226,183,20,0.6)] transition-all duration-500"
          >
            START SIMULATION
          </Button>
        </Link>
        
        <div className="mt-20 grid grid-cols-3 gap-12 text-center text-muted-text/60 font-orbitron tracking-widest text-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-class-upper font-bold">100</span>
            YEARS
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-class-middle font-bold">5</span>
            CLASSES
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-class-lower font-bold">1</span>
            OUTCOME
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-text/30 font-rajdhani">
        v0.1.0 • PHASE 1 ALPHA
      </div>
    </main>
  );
}
