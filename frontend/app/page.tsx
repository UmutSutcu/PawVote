"use client";
import React, { useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";
import WalletConnection from "@/app/components/WalletConnection";
import AnimalForm from "@/app/components/AnimalForm";
import AnimalList from "@/app/components/AnimalList";

export interface Animal {
  name: string;
  votes: number;
  hasVoted?: boolean;
}

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);

  // Sayfa yüklendiğinde cüzdan kontrolü
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
          await loadAnimals(address);
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
      }
    };
    checkFreighter();
  }, []);

  // Hayvanları yükle (mock data - gerçek uygulamada smart contract'tan gelecek)
  const loadAnimals = async (userAddress: string) => {
    setLoading(true);
    try {
      // Bu kısım gerçek uygulamada smart contract'tan veri çekecek
      // Şimdilik mock data kullanıyoruz
      const mockAnimals: Animal[] = [
        { name: "Aslan", votes: 15, hasVoted: false },
        { name: "Kedi", votes: 12, hasVoted: true },
        { name: "Köpek", votes: 8, hasVoted: false },
        { name: "Kartal", votes: 5, hasVoted: false },
      ];
      
      // Oy sayısına göre sırala (büyükten küçüğe)
      const sortedAnimals = mockAnimals.sort((a, b) => b.votes - a.votes);
      setAnimals(sortedAnimals);
    } catch (error) {
      console.error("Error loading animals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cüzdan bağlantısı
  const handleWalletConnect = (address: string) => {
    setPublicKey(address);
    loadAnimals(address);
  };

  // Hayvan ekleme
  const handleAddAnimal = async (animalName: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // Bu kısım gerçek uygulamada smart contract çağrısı yapacak
      const newAnimal: Animal = {
        name: animalName,
        votes: 0,
        hasVoted: false
      };
      
      setAnimals(prev => [...prev, newAnimal].sort((a, b) => b.votes - a.votes));
    } catch (error) {
      console.error("Error adding animal:", error);
    } finally {
      setLoading(false);
    }
  };

  // Oy verme
  const handleVote = async (animalName: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // Bu kısım gerçek uygulamada smart contract çağrısı yapacak
      setAnimals(prev => 
        prev.map(animal => 
          animal.name === animalName 
            ? { ...animal, votes: animal.votes + 1, hasVoted: true }
            : animal
        ).sort((a, b) => b.votes - a.votes)
      );
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setLoading(false);
    }
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
            Sevdiğiniz hayvanları ekleyin ve en popüler hayvanları belirlemek için oy verin!
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Animal Form */}
            <div>
              <AnimalForm 
                onAddAnimal={handleAddAnimal}
                existingAnimals={animals.map(a => a.name)}
                loading={loading}
              />
            </div>

            {/* Animal List */}
            <div>
              <AnimalList 
                animals={animals}
                onVote={handleVote}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-300 mt-12">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-xl">
              Hayvan oylama sistemine katılmak için lütfen cüzdanınızı bağlayın
            </p>
          </div>
        )}
      </div>
    </div>
  );
}