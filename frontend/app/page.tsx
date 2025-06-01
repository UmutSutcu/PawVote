"use client";
import React, { useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";
import WalletConnection from "@/app/components/WalletConnection";
import VotingCard from "@/app/components/VotingCard";
import AnimalForm from "@/app/components/AnimalForm";
import AnimalList from "@/app/components/AnimalList";
import { StellarService } from "@/app/services/stellarService";

export interface Animal {
  id: string;
  name: string;
  emoji: string;
  votes: number;
  hasVoted?: boolean;
}

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [stellarService, setStellarService] = useState<StellarService | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Initial animal list - in a real app this would come from a smart contract
  const initialAnimals: Animal[] = [
    { id: "1", name: "Aslan", emoji: "🦁", votes: 15, hasVoted: false },
    { id: "2", name: "Kedi", emoji: "🐱", votes: 12, hasVoted: false },
    { id: "3", name: "Köpek", emoji: "🐕", votes: 20, hasVoted: false },
    { id: "4", name: "Kartal", emoji: "🦅", votes: 8, hasVoted: false },
    { id: "5", name: "Balık", emoji: "🐠", votes: 5, hasVoted: false },
    { id: "6", name: "Kaplumbağa", emoji: "🐢", votes: 3, hasVoted: false },
  ];

  // Check wallet connection and load animals on page load
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
          setStellarService(new StellarService());
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
      }
    };
    checkFreighter();
    loadAnimals();
  }, []);

  // Load animals
  const loadAnimals = async () => {
    setLoading(true);
    try {
      // Sort animals by votes (highest to lowest)
      const sortedAnimals = [...initialAnimals].sort((a, b) => b.votes - a.votes);
      setAnimals(sortedAnimals);
      
      // Calculate total votes
      const total = sortedAnimals.reduce((sum, animal) => sum + animal.votes, 0);
      setTotalVotes(total);
    } catch (error) {
      console.error("Error loading animals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Wallet connection handler
  const handleWalletConnect = (address: string) => {
    setPublicKey(address);
    setStellarService(new StellarService());
  };

  // Vote success handler
  const handleVoteSuccess = async (animalId: string, voteType: 'like' | 'dislike') => {
    setLoading(true);
    try {
      // Update local state to reflect the vote
      setAnimals(prev => 
        prev.map(animal => 
          animal.id === animalId 
            ? { ...animal, votes: animal.votes + (voteType === 'like' ? 1 : -1), hasVoted: true }
            : animal
        ).sort((a, b) => b.votes - a.votes)
      );
      
      setTotalVotes(prev => prev + (voteType === 'like' ? 1 : -1));
    } catch (error) {
      console.error("Error updating vote:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new animal handler
  const handleAddAnimal = (name: string) => {
    const newAnimal: Animal = {
      id: (animals.length + 1).toString(),
      name: name,
      emoji: getAnimalEmoji(name),
      votes: 0,
      hasVoted: false
    };
    
    setAnimals(prev => [...prev, newAnimal].sort((a, b) => b.votes - a.votes));
  };

  // Vote handler for AnimalList component
  const handleVote = async (animalName: string) => {
    const animal = animals.find(a => a.name === animalName);
    if (animal && stellarService) {
      await handleVoteSuccess(animal.id, 'like');
    }
  };

  // Get animal emoji helper function
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
    };
    
    return animalEmojis[name.toLowerCase()] || '🐾';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            🐾 Hayvan Oylama DApp
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stellar (XLM) ödemeleri kullanarak sevdiğiniz hayvanlara oy verin! Her oy 0.1 XLM tutar.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnection 
            publicKey={publicKey}
            onConnect={handleWalletConnect}
          />
        </div>

        {/* Main Content */}
        {publicKey ? (
          <div>
            {/* Stats */}
            <div className="text-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-white mb-2">Toplam Oy</h3>
                <div className="text-4xl font-bold text-yellow-400">{totalVotes}</div>
                <p className="text-gray-300 mt-2">Harcanan XLM: {(totalVotes * 0.1).toFixed(1)} XLM</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex space-x-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  🎴 Kart Görünümü
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📋 Liste Görünümü
                </button>
              </div>
            </div>

            {/* Add Animal Form */}
            <div className="mb-8">
              <AnimalForm 
                onAddAnimal={handleAddAnimal}
                existingAnimals={animals.map(animal => animal.name)}
                loading={loading}
              />
            </div>

            {viewMode === 'cards' ? (
              /* Animal Voting Cards */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animals.map((animal) => (
                  <VotingCard
                    key={animal.id}
                    animal={animal}
                    userPublicKey={publicKey}
                    onVoteSuccess={handleVoteSuccess}
                  />
                ))}
              </div>
            ) : (
              /* Animal List View */
              <AnimalList 
                animals={animals}
                onVote={handleVote}
                loading={loading}
              />
            )}

            {/* Instructions */}
            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Nasıl Oy Verilir:</h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center"><span className="text-blue-400 mr-2">1.</span> Freighter cüzdanınızın Stellar Testnet'e bağlı olduğundan emin olun</p>
                <p className="flex items-center"><span className="text-blue-400 mr-2">2.</span> Oy vermek için cüzdanınızda en az 0.1 XLM bulunduğundan emin olun</p>
                <p className="flex items-center"><span className="text-blue-400 mr-2">3.</span> Yeni hayvan ekleyebilir veya mevcut hayvanlara oy verebilirsiniz</p>
                <p className="flex items-center"><span className="text-blue-400 mr-2">4.</span> Kart görünümü ile liste görünümü arasında geçiş yapabilirsiniz</p>
                <p className="flex items-center"><span className="text-blue-400 mr-2">5.</span> Her oy 0.1 XLM ödeme gerektirir ve Freighter cüzdanınızda onaylanmalıdır</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-300 mt-12">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-xl mb-4">
              Hayvanlara oy vermeye başlamak için Freighter cüzdanınızı bağlayın!
            </p>
            <p className="text-gray-400">
              Freighter tarayıcı uzantısının yüklendiğinden ve Stellar Testnet'te olduğunuzdan emin olun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}