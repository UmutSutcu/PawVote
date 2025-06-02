"use client";
import React from "react";
import { Animal } from "@/app/page";

interface AnimalListProps {
  animals: Animal[];
  onVote: (animalName: string) => Promise<void>;
  loading: boolean;
}

export default function AnimalList({ animals, onVote, loading }: AnimalListProps) {
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏅";
    }
  };

  const getAnimalEmoji = (name: string) => {
    const animalEmojis: { [key: string]: string } = {
      'aslan': '🦁',
      'kedi': '🐱',
      'köpek': '🐶',
      'kartal': '🦅',
      'fil': '🐘',
      'kaplan': '🐯',
      'panda': '🐼',
      'koala': '🐨',
      'zebra': '🦓',
      'zürafa': '🦒',
      'maymun': '🐵',
      'ayı': '🐻',
      'tavşan': '🐰',
      'kaplumbağa': '🐢',
      'balık': '🐟',
      'köpekbalığı': '🦈',
      'yunus': '🐬',
      'balina': '🐋',
      'ahtapot': '🐙',
      'kelebek': '🦋',
      'arı': '🐝',
      'karınca': '🐜',
      'örümcek': '🕷️',
      'yılan': '🐍',
      'timsah': '🐊',
      'kurbağa': '🐸',
      'penguen': '🐧',
      'flamingo': '🦩',
      'papağan': '🦜',
      'baykuş': '🦉',
      'lemur': '🦧',
      'kopekbaligi': '🦈',
      'mirket': '🦡',
      'sincap': '🐿️',
      'tavuk': '🐔',
      'kanarya': '🐤',
      'inek': '🐄',
      'at': '🐎',
      'keçi': '🐐',
    };
    
    return animalEmojis[name.toLowerCase()] || '🐾';
  };

  if (animals.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🦁</div>
          <h3 className="text-xl font-bold text-white mb-2">Henüz hayvan eklenmemiş</h3>
          <p className="text-gray-400">İlk hayvanı ekleyerek başlayın!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">🏆</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Hayvan Sıralaması</h2>
      </div>

      <div className="space-y-3">
        {animals.map((animal, index) => (
          <div
            key={animal.name}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 
                     hover:bg-white/10 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getRankEmoji(index)}</span>
                  <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getAnimalEmoji(animal.name)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{animal.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">❤️</span>
                      <span className="text-red-400 font-semibold">
                        {animal.votes} oy
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {animal.hasVoted ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                    <span className="text-green-400">✅</span>
                    <span className="text-green-400 font-medium text-sm">Oy Verildi</span>
                  </div>                ) : (
                  <button
                    onClick={() => onVote(animal.name)}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600
                             disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                             text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 
                             transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Ödeme...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span className="text-sm">0.1 XLM Öde</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>

            {index < 3 && (
              <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}
                  style={{ 
                    width: `${Math.max(10, (animal.votes / Math.max(animals[0]?.votes || 1, 1)) * 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center space-x-2">
          <span className="text-purple-400">📊</span>
          <span className="text-purple-400 font-medium text-sm">
            Toplam {animals.length} hayvan • {animals.reduce((sum, animal) => sum + animal.votes, 0)} oy
          </span>
        </div>
      </div>
    </div>
  );
}