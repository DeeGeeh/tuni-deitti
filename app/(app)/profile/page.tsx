// Profile page
"use client";
import React, { useState, FormEvent, useEffect } from "react";

export default function DashboardApp() {
  const [name, setName] = useState<string>("");
  const [userName, setUsername] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [guild, setGuild] = useState<string>("");
  const [interestedEvents, setInterestedEvents] = useState<string>("");
  const [changedField, setChangedField] = useState<Boolean>(false);

  interface FormData {
    name: string;
    userName: string;
    age: string;
    guild: string;
    interestedEvents: string;
  }

  const handelSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    interface FormData {
      name: string;
      userName: string;
      age: string;
      guild: string;
      interestedEvents: string;
    }

    const fdata: FormData = {
      name,
      userName,
      age,
      guild,
      interestedEvents,
    };
    console.log("Form submitted:", fdata);
  };

  useEffect(() => {
    const allFilled = [name, userName, age, guild, interestedEvents].some(
      (field) => (field ?? "").trim() !== ""
    );

    setChangedField(allFilled);
  }, [name, userName, age, guild, interestedEvents]);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-16 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tuni-blue">PROFIILI</h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handelSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Nimi
            </label>
            <input
              id="nimi"
              name="nimi"
              type="nimi"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Teemu Teekkari"
              value={name}
              onChange={handleChange(setName)}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-foreground"
            >
              Käyttäjänimi
            </label>
            <input
              id="käyttäjänimi"
              name="käyttäjänimi"
              type="käyttäjänimi"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="käyttäjänimesi"
              value={userName}
              onChange={handleChange(setUsername)}
            />
          </div>
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-foreground"
            >
              Ikä
            </label>
            <input
              id="ikä"
              name="ikä"
              type="ikä"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="ikäsi"
              value={age}
              onChange={handleChange(setAge)}
            />
          </div>
          <div>
            <label
              htmlFor="guild"
              className="block text-sm font-medium text-foreground"
            >
              Kilta tai Ainejärjestö
            </label>
            <input
              id="kilta"
              name="kilta"
              type="kilta"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="esim. Indecs"
              value={guild}
              onChange={handleChange(setGuild)}
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-foreground"
            >
              Tapahtumat
            </label>
            <input
              id="tapahtumat"
              name="tapahtumat"
              type="tapahtumat"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Listaa tapahtumat joihin menet"
              value={interestedEvents}
              onChange={handleChange(setInterestedEvents)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={!changedField}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue disabled:opacity-50"
            >
              Tallenna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
