import { Clock, Heart, Moon, Sun } from "lucide-react";

export default function Home() {
  const prayerTimes = [
    { name: "Subuh", time: "05:12", icon: Moon },
    { name: "Dzuhur", time: "12:25", icon: Sun },
    { name: "Ashar", time: "15:42", icon: Sun },
    { name: "Maghrib", time: "18:15", icon: Sun },
    { name: "Isya", time: "19:35", icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-midnight-blue">
                <Clock className="w-5 h-5 text-warm-cream" />
              </div>
              <h1 className="text-2xl font-serif font-semibold text-midnight-blue">
                Awwal
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a 
                href="#" 
                className="text-sm transition-colors hover:opacity-70 text-midnight-blue"
              >
                Panduan
              </a>
              <a 
                href="#" 
                className="text-sm transition-colors hover:opacity-70 text-midnight-blue"
              >
                Tentang
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16 animate-gentle-fade-in">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6 leading-tight text-midnight-blue">
              Mendahulukan Shalat<br />di Awal Waktu
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-midnight-blue/80">
              Awwal membantu kita mendahulukan shalat, satu waktu dalam satu hari.
            </p>
            <div className="flex items-center justify-center space-x-2 mb-12">
              <Heart className="w-5 h-5 text-sage-green" />
              <span className="text-sm font-medium text-sage-green">
                Teman pengingat yang lembut
              </span>
            </div>
          </section>

          {/* Prayer Times Card */}
          <section className="mb-16">
            <div className="rounded-3xl p-8 shadow-sm bg-white border border-gray-100">
              <h3 className="text-xl font-serif font-medium mb-6 text-center text-midnight-blue">
                Jadwal Shalat Hari Ini
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {prayerTimes.map((prayer, index) => {
                  const Icon = prayer.icon;
                  return (
                    <div 
                      key={prayer.name}
                      className="text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105 bg-warm-cream"
                    >
                      <Icon 
                        className="w-6 h-6 mx-auto mb-2 text-sage-green" 
                      />
                      <div className="font-medium text-sm mb-1 text-midnight-blue">
                        {prayer.name}
                      </div>
                      <div className="text-lg font-serif font-semibold text-midnight-blue">
                        {prayer.time}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-midnight-blue/60">
                  Waktu Subuh telah tiba.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-sage-green/20">
                  <Clock className="w-7 h-7 text-sage-green" />
                </div>
                <h3 className="text-lg font-serif font-medium mb-2 text-midnight-blue">
                  Pengingat Lembut
                </h3>
                <p className="text-sm leading-relaxed text-midnight-blue/70">
                  Bukan alarm yang memaksa, tapi teman yang mengingatkan dengan cara yang tenang.
                </p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-soft-gold/20"
                >
                  <Heart 
                    className="w-7 h-7 text-soft-gold" 
                  />
                </div>
                <h3 
                  className="text-lg font-serif font-medium mb-2 text-midnight-blue"
                >
                  Cermin Kebiasaan
                </h3>
                <p 
                  className="text-sm leading-relaxed text-midnight-blue/70"
                >
                  Refleksi harian untuk melihat konsistensi dan kemajuan ibadah kita.
                </p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-midnight-blue/10"
                >
                  <Moon 
                    className="w-7 h-7 text-midnight-blue" 
                  />
                </div>
                <h3 
                  className="text-lg font-serif font-medium mb-2 text-midnight-blue"
                >
                  Teman Muhasabah
                </h3>
                <p 
                  className="text-sm leading-relaxed text-midnight-blue/70"
                >
                  Menemani perjalanan spiritual dengan pendekatan yang rendah hati.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div 
              className="rounded-3xl p-12 bg-midnight-blue"
            >
              <h3 
                className="text-2xl font-serif font-medium mb-4 text-warm-cream"
              >
                Mari jaga shalat di awal waktu
              </h3>
              <p 
                className="text-lg mb-8 text-warm-cream/90"
              >
                Mulai perjalanan konsistensi ibadah dengan cara yang lembut dan personal.
              </p>
              <button 
                className="px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg bg-sage-green text-midnight-blue"
              >
                Mulai Sekarang
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <p 
            className="text-sm text-midnight-blue/50"
          >
            Alhamdulillah, Subuh hari ini sudah terlaksana.
          </p>
        </div>
      </footer>
    </div>
  );
}
