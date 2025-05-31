"use client";
import React, { useState } from "react";

interface AnimalFormProps {
  onAddAnimal: (name: string) => void;
  existingAnimals: string[];
  loading: boolean;
}

export default function AnimalForm({ onAddAnimal, existingAnimals, loading }: AnimalFormProps) {
  const [animalName, setAnimalName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (animalName.trim().length < 1) {
      setError("Hayvan adı en az 1 karakter olmalı");
      return;
    }
    
    if (animalName.trim().length > 30) {
      setError("Hayvan adı en fazla 30 karakter olabilir");
      return;
    }

    // Duplicate kontrolü
    const normalizedInput = animalName.trim().toLowerCase();
    const isDuplicate = existingAnimals.some(
      animal => animal.toLowerCase() === normalizedInput
    );

    if (isDuplicate) {
      setError("Bu hayvan zaten listede mevcut");
      return;
    }

    // Başarılı validation
    setError("");
    onAddAnimal(animalName.trim());
    setAnimalName("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnimalName(value);
    
    // Anlık validasyon
    if (error) {
      if (value.trim().length >= 1 && value.trim().length <= 30) {
        const normalizedInput = value.trim().toLowerCase();
        const isDuplicate = existingAnimals.some(
          animal => animal.toLowerCase() === normalizedInput
        );
        if (!isDuplicate) {
          setError("");
        }
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">➕</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Yeni Hayvan Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="animalName" className="block text-sm font-medium text-gray-300 mb-2">
            Hayvan Adı
          </label>
          <input
            type="text"
            id="animalName"
            value={animalName}
            onChange={handleInputChange}
            placeholder="Hayvan adını girin (örn. Aslan, Kedi...)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 
                     focus:border-transparent backdrop-blur-sm transition-all duration-200"
            maxLength={30}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {animalName.length}/30 karakter
            </span>
            {error && (
              <span className="text-red-400 text-xs font-medium">
                {error}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || animalName.trim().length === 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                   disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                   text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 
                   transform hover:scale-105 active:scale-95 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Ekleniyor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🐾</span>
              <span>Hayvan Ekle</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <div className="flex items-start space-x-2">
          <span className="text-blue-400 mt-0.5">💡</span>
          <div className="text-blue-400 text-sm">
            <strong>İpucu:</strong> Hayvan adı 1-30 karakter arasında olmalı ve daha önce eklenmemiş olmalıdır.
          </div>
        </div>
      </div>
    </div>
  );
}