import * as StellarSdk from '@stellar/stellar-sdk';
import freighterApi from '@stellar/freighter-api';

// Extract needed classes from StellarSdk
const { 
  Networks, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Memo, 
  BASE_FEE 
} = StellarSdk;

// Stellar Horizon server (Testnet)
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Testnet network passphrase
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Oy verme ücreti (XLM cinsinden)
const VOTING_FEE = '0.1'; // 0.1 XLM

// Ödeme alacak hesap (Treasury hesabı - Test hesabı)
// Bu hesabı kendi Stellar testnet hesabınızla değiştirin
const TREASURY_ACCOUNT = 'GDIRQT5UVUBQNV74XYBAQXKTT7DE2QYTIONP7HALM2ECMCTRZG4H4YZI'; // Test hesabı

export class StellarService {
  
  static async getAccountBalance(publicKey: string): Promise<string> {
    try {
      const account = await server.loadAccount(publicKey);
      const balance = account.balances.find((balance: { asset_type: string; }) => balance.asset_type === 'native');
      return balance ? balance.balance : '0';
    } catch (error) {
      console.error('Hesap bakiyesi alınamadı:', error);
      console.error('Hesap bakiyesi alınamadı:', error);
      return '0';
    }
  }

  // Hesabın var olup olmadığını kontrol et
  static async checkAccountExists(publicKey: string): Promise<boolean> {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Oy verme işlemi ve ödeme
  static async submitVoteWithPayment(
    voterPublicKey: string, 
    voteData: { animalId: string; voteType: 'like' | 'dislike' }
  ) {
    try {
      // 1. Hesabın var olduğunu kontrol et
      const accountExists = await this.checkAccountExists(voterPublicKey);
      if (!accountExists) {
        throw new Error('Hesap bulunamadı. Lütfen hesabınızı testnet\'te aktifleştirin.');
      }

      // 2. Hesap bakiyesini kontrol et
      const balance = await this.getAccountBalance(voterPublicKey);
      const requiredBalance = parseFloat(VOTING_FEE) + 0.01; // 0.01 XLM transaction fee için
      
      if (parseFloat(balance) < requiredBalance) {
        throw new Error(`Yetersiz bakiye. En az ${requiredBalance} XLM gerekli. Mevcut bakiye: ${balance} XLM`);
      }

      // 3. Treasury hesabının var olduğunu kontrol et
      const treasuryExists = await this.checkAccountExists(TREASURY_ACCOUNT);
      if (!treasuryExists) {
        throw new Error('Treasury hesabı bulunamadı.');
      }      // 4. Transaction builder oluştur
      const sourceAccount = await server.loadAccount(voterPublicKey);
        const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
      .addOperation(
        Operation.payment({
          destination: TREASURY_ACCOUNT,
          asset: Asset.native(),
          amount: VOTING_FEE,
        })
      )
      .addMemo(
        // Oy bilgisini memo olarak ekle
        Memo.text(`VOTE:${voteData.animalId}:${voteData.voteType}`)
      )
      .setTimeout(30)
      .build();

      // 5. Freighter ile transaction'ı imzala
      const signedTransaction = await freighterApi.signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: voterPublicKey,
      });      // 6. Transaction'ı Stellar ağına gönder
      const transactionResult = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedTransaction.signedTxXdr, NETWORK_PASSPHRASE)
      );

      return {
        success: true,
        transactionHash: transactionResult.hash,
        votingFee: VOTING_FEE,
        ledger: transactionResult.ledger,
      };

    } catch (error: any) {
      console.error('Oy verme işlemi başarısız:', error);
      
      // Hata mesajlarını daha anlaşılır hale getir
      if (error.message?.includes('op_underfunded')) {
        throw new Error('Yetersiz bakiye. Lütfen hesabınıza XLM ekleyin.');
      } else if (error.message?.includes('op_no_destination')) {
        throw new Error('Treasury hesabı bulunamadı.');
      } else if (error.message?.includes('tx_failed')) {
        throw new Error('Transaction başarısız oldu. Lütfen tekrar deneyin.');
      }
      
      throw error;
    }
  }

  // Transaction durumunu kontrol et
  static async getTransactionStatus(transactionHash: string) {
    try {
      const transaction = await server.transactions().transaction(transactionHash).call();
      return {
        successful: transaction.successful,
        fee: transaction.fee_charged,
        memo: transaction.memo,
        ledger: transaction.ledger,
        created_at: transaction.created_at,
      };
    } catch (error) {
      console.error('Transaction durumu alınamadı:', error);
      return null;
    }
  }

  // Treasury hesabına gelen ödemeleri listele
  static async getTreasuryPayments(limit: number = 10) {
    try {
      const payments = await server
        .payments()
        .forAccount(TREASURY_ACCOUNT)
        .order('desc')
        .limit(limit)
        .call();

      return payments.records
        .filter((payment: any) => payment.type === 'payment' && payment.asset_type === 'native')
        .map((payment: any) => ({
          id: payment.id,
          from: payment.from,
          amount: payment.amount,
          created_at: payment.created_at,
          transaction_hash: payment.transaction_hash,
        }));
    } catch (error) {
      console.error('Treasury ödemeleri alınamadı:', error);
      return [];
    }
  }

  // Test için hesap funder (sadece testnet için)
  static async fundTestAccount(publicKey: string) {
    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      if (response.ok) {
        return { success: true, message: 'Hesap 10000 XLM ile fonlandı!' };
      } else {
        throw new Error('Hesap fonlanamadı');
      }
    } catch (error) {
      console.error('Hesap fonlama hatası:', error);
      return { success: false, message: 'Hesap fonlanamadı' };
    }
  }

  // Voting fee'yi döndür
  static getVotingFee(): string {
    return VOTING_FEE;
  }

  // Treasury hesabını döndür
  static getTreasuryAccount(): string {
    return TREASURY_ACCOUNT;
  }
}
