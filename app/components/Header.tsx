import { Clock } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center mb-8">
      <div className="w-16 h-16 rounded-full bg-midnight-blue flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-warm-cream" />
      </div>
      <h1 className="text-3xl font-serif font-semibold text-midnight-blue mb-2">
        Awwal
      </h1>
      <p className="text-midnight-blue/70 text-sm">
        Mendahulukan kebaikan, memulai dengan shalat
      </p>
    </header>
  );
}