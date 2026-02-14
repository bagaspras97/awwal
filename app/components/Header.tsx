import { Clock } from "lucide-react";
import AuthButton from "./AuthButton";

export default function Header() {
  return (
    <header className="mb-8">
      {/* Auth Section */}
      <div className="flex justify-end mb-6">
        <AuthButton />
      </div>
      
      {/* Brand Section */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-midnight-blue flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-warm-cream" />
        </div>
        <h1 className="text-3xl font-serif font-semibold text-midnight-blue mb-2">
          Awwal
        </h1>
        <p className="text-midnight-blue/70 text-sm">
          Mendahulukan kebaikan, memulai dengan shalat
        </p>
      </div>
    </header>
  );
}