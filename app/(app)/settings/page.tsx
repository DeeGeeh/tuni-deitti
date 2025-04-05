'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [error, setError] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-16 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tuni-blue">ASETUKSET</h1>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6">
          {/* Language Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Kieliasetukset</h2>
            <Select label="Kieli" options={['Suomi', 'English']} />
          </section>

          {/* Notification Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Ilmoitusasetukset</h2>
            <Toggle label="Salli push-ilmoitukset" />
          </section>

          {/* Privacy & Block Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Muut asetukset</h2>
            <Toggle label="Piilota käyttäjätilini" />
  
            {/* Separate buttons into different rows */}
            <div className="mt-2">
              <button className="text-blue-600 underline">Näytä estetyt käyttäjät</button>
            </div>
            <div className="mt-2">
              <button className="text-red-600 underline">Raportoi väärinkäytös</button>
            </div>
          </section>

         {/* GDPR/Auth Section */}
          <section>
            <div className="pt-2">
            <h2 className="text-xl font-semibold mb-4 break-words">Tietosuoja</h2>
              <div className="mt-2">
                <button className="text-blue-600 underline">Vaihda salasana</button>
              </div>
              <div className="mt-2">
                <button className="text-blue-600 underline">Lataa tietoni</button>
              </div>
              <div className="mt-2">
                <button className="text-blue-600 underline">Poista kaikki matchit ja keskustelut</button>
              </div>
              <div className="mt-2">
                <button className="text-red-600 underline">Poista käyttäjätili</button>
              </div>
            </div>
          </section>

          {/* Save Changes Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue"
            >
              Tallenna asetukset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Mini UI-components ---

function Input({ label, value, type = 'text', disabled = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
      />
    </div>
  );
}

function Select({ label, options = [] }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20">
        {options.map((opt: string) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-10 h-6 rounded-full relative transition ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
            enabled ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}
