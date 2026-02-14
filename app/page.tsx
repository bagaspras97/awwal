import Header from './components/Header';
import PrayerTimesList from './components/PrayerTimesList';
import ActionSection from './components/ActionSection';
import UserStats from './components/UserStats';
import WelcomeMessage from './components/WelcomeMessage';

export default function Home() {
  return (
    <main className="min-h-screen bg-warm-cream p-6">
      <div className="max-w-md mx-auto">
        <Header />
        <WelcomeMessage />
        <UserStats />
        <PrayerTimesList />
        <ActionSection />
      </div>
    </main>
  );
}