"use client";
import React, { useState } from "react";
import freighterApi from "@stellar/freighter-api";

interface WalletConnectionProps {
  publicKey: string | null;
  onConnect: (address: string) => void;
}

export default function WalletConnection({ publicKey, onConnect }: WalletConnectionProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      await freighterApi.setAllowed();
      const { address } = await freighterApi.getAddress();
      onConnect(address);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
      alert("Cüzdan bağlantısında hata oluştu. Freighter uzantısının yüklü olduğundan emin olun.");
    } finally {
      setConnecting(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">👛</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Stellar Cüzdan</h3>
            {publicKey ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-mono text-sm">
                  {truncateAddress(publicKey)}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Bağlı değil</span>
            )}
          </div>
        </div>

        {!publicKey && (
          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                     text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 
                     transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {connecting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Bağlanıyor...</span>
              </div>
            ) : (
              "Freighter Bağla"
            )}
          </button>
        )}
      </div>

      {publicKey && (
        <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✅</span>
            <span className="text-green-400 font-medium">Cüzdan başarıyla bağlandı!</span>
          </div>
        </div>
      )}
    </div>
  );
}