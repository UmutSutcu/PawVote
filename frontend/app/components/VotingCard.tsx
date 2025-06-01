"use client";
import React, { useState, useEffect } from 'react';
import { StellarService } from '../services/stellarService';

interface Animal {
  id: string;
  name: string;
  emoji: string;
  votes: number;
}

interface VotingCardProps {
  animal: Animal;
  userPublicKey: string | null;
  onVoteSuccess: (animalId: string, voteType: 'like' | 'dislike') => void;
}

export default function VotingCard({ animal, userPublicKey, onVoteSuccess }: VotingCardProps) {
  const [voting, setVoting] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [lastTransactionHash, setLastTransactionHash] = useState<string>('');

  // Kullanıcı bakiyesini yükle
  useEffect(() => {
    if (userPublicKey) {
      loadBalance();
    }
  }, [userPublicKey]);

  const loadBalance = async () => {
    if (userPublicKey) {
      try {
        const userBalance = await StellarService.getAccountBalance(userPublicKey);
        setBalance(userBalance);
      } catch (error) {
        console.error('Bakiye yüklenemedi:', error);
      }
    }
  };

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!userPublicKey) {
      alert('❌ Lütfen önce cüzdanınızı bağlayın!');
      return;
    }

    const votingFee = parseFloat(StellarService.getVotingFee());
    const requiredBalance = votingFee + 0.01; // Transaction fee için ek

    if (parseFloat(balance) < requiredBalance) {
      const shouldFund = window.confirm(
        `❌ Yetersiz bakiye!\n\n` +
        `Gerekli: ${requiredBalance} XLM\n` +
        `Mevcut: ${balance} XLM\n\n` +
        `Testnet hesabınızı 10000 XLM ile fonlamak ister misiniz?`
      );
      
      if (shouldFund) {
        try {
          const fundResult = await StellarService.fundTestAccount(userPublicKey);
          if (fundResult.success) {
            alert('✅ ' + fundResult.message);
            await loadBalance();
          } else {
            alert('❌ ' + fundResult.message);
            return;
          }
        } catch (error) {
          alert('❌ Hesap fonlanamadı');
          return;
        }
      } else {
        return;
      }
    }

    setVoting(true);
    try {
      // Stellar ile ödeme işlemi
      const result = await StellarService.submitVoteWithPayment(userPublicKey, {
        animalId: animal.id,
        voteType: voteType
      });

      if (result.success) {
        // Başarılı oy verme
        onVoteSuccess(animal.id, voteType);
        setLastTransactionHash(result.transactionHash);
        
        // Bildiri göster
        alert(
          `✅ Oyunuz başarıyla kaydedildi!\n\n` +
          `🐾 Hayvan: ${animal.name}\n` +
          `${voteType === 'like' ? '👍' : '👎'} Oy türü: ${voteType === 'like' ? 'Beğeni' : 'Beğenmeme'}\n` +
          `💰 Ödenen: ${result.votingFee} XLM\n` +
          `🔗 Transaction: ${result.transactionHash.slice(0, 8)}...\n` +
          `📋 Ledger: ${result.ledger}`
        );

        // Bakiyeyi güncelle
        await loadBalance();
      }

    } catch (error: any) {
      console.error('Oy verme hatası:', error);
      alert(`❌ Oy verme başarısız!\n\n${error.message}`);
    } finally {
      setVoting(false);
    }
  };

  const handleFundAccount = async () => {
    if (!userPublicKey) return;

    try {
      const result = await StellarService.fundTestAccount(userPublicKey);
      if (result.success) {
        alert('✅ ' + result.message);
        await loadBalance();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('❌ Hesap fonlanamadı');
    }
  };

  const viewTransaction = () => {
    if (lastTransactionHash) {
      window.open(`https://stellar.expert/explorer/testnet/tx/${lastTransactionHash}`, '_blank');
    }
  };

  const votingFee = StellarService.getVotingFee();
  const requiredBalance = parseFloat(votingFee) + 0.01;
  const hasEnoughBalance = parseFloat(balance) >= requiredBalance;

  return (
    <div className="glass-card p-6 max-w-sm mx-auto transform transition-all duration-300 hover:scale-105">
      <div className="text-center mb-4">
        <div className="text-6xl mb-3">{animal.emoji}</div>
        <h3 className="text-xl font-bold text-white mb-2">{animal.name}</h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">❤️</span>
          <span className="text-lg font-semibold text-red-400">{animal.votes}</span>
          <span className="text-sm text-gray-400">oy</span>
        </div>
      </div>

      {/* Bakiye göstergesi */}
      {userPublicKey && (
        <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-300 text-sm">💰 Bakiye:</span>
            <span className="text-blue-300 font-mono text-sm">
              {parseFloat(balance).toFixed(4)} XLM
            </span>
          </div>
          {!hasEnoughBalance && (
            <button
              onClick={handleFundAccount}
              className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors"
            >
              🚰 Test Hesabını Fonla (10000 XLM)
            </button>
          )}
        </div>
      )}

      {/* Oy verme uyarısı */}
      <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
        <div className="text-center">
          <span className="text-yellow-300 text-sm">
            💰 Oy verme ücreti: {votingFee} XLM
          </span>
          <br />
          <span className="text-yellow-200 text-xs">
            (+ ~0.01 XLM transaction fee)
          </span>
        </div>
      </div>

      {/* Oy verme butonları */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={() => handleVote('like')}
          disabled={voting || !userPublicKey || !hasEnoughBalance}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
            !voting && userPublicKey && hasEnoughBalance
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
          }`}
        >
          {voting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">İşleniyor...</span>
            </div>
          ) : (
            <span>👍 Beğen</span>
          )}
        </button>

        <button
          onClick={() => handleVote('dislike')}
          disabled={voting || !userPublicKey || !hasEnoughBalance}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
            !voting && userPublicKey && hasEnoughBalance
              ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
          }`}
        >
          {voting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">İşleniyor...</span>
            </div>
          ) : (
            <span>👎 Beğenme</span>
          )}
        </button>
      </div>

      {/* Yetersiz bakiye uyarısı */}
      {userPublicKey && !hasEnoughBalance && (
        <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <div className="text-center">
            <span className="text-red-300 text-sm">
              ⚠️ Yetersiz bakiye! En az {requiredBalance.toFixed(4)} XLM gerekli.
            </span>
          </div>
        </div>
      )}

      {/* Son transaction linki */}
      {lastTransactionHash && (
        <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <button
            onClick={viewTransaction}
            className="w-full text-purple-300 hover:text-purple-200 text-sm transition-colors"
          >
            🔍 Son işlemi görüntüle
            <br />
            <span className="font-mono text-xs">
              {lastTransactionHash.slice(0, 8)}...{lastTransactionHash.slice(-8)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
