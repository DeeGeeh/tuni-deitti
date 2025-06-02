// LANDING PAGE
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-gray-900 mb-6">Löydä Wappufrendi</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tutustu muihin opiskelijoihin ja löydä seuraa Wappuun. TuniDeitti
            yhdistää sinut samanhenkisten opiskelijoiden kanssa.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-tuni-blue text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-tuni-blue/90 transition-colors"
          >
            Aloita nyt
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Opiskelijoille
            </h3>
            <p className="text-gray-600">
              Vain yliopisto-opiskelijoille. Varmista turvallinen ja luotettava
              ympäristö.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Yhteisiä kiinnostuksia
            </h3>
            <p className="text-gray-600">
              Löydä frendejä samoilla kiinnostuksenkohteilla ja arvoilla.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Wapputapahtumat
            </h3>
            <p className="text-gray-600">
              Jaa ja löydä Wapputapahtumia. Älä vietä Wappua yksin!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-sky-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4 text-black">
            Valmiina löytämään uusia frendejä?
          </h2>
          <p className="text-gray-600 mb-8">
            Liity satojen muiden opiskelijoiden joukkoon ja tee Wapustasi
            ikimuistoinen!
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-tuni-blue text-white px-8 py-3 rounded-full font-medium hover:bg-tuni-blue/90 transition-colors"
          >
            Luo tili nyt
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2025 UniFrendi. Kaikki oikeudet pidätetään.</p>
        </div>
      </footer>
    </div>
  );
}
