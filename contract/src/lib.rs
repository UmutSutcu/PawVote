#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Map, String, Vec, log
};

// Veri yapıları
#[derive(Clone)]
#[contracttype]
pub struct Animal {
    pub name: String,
    pub votes: u64,
    pub creator: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Animals,           // Tüm hayvanların listesi
    AnimalVotes(String), // Belirli bir hayvanın oy sayısı
    UserVotes(Address),  // Kullanıcının oy verdiği hayvanlar
    TotalAnimals,      // Toplam hayvan sayısı
    Admin,             // Kontrat yöneticisi
}

// Hata kodları
#[derive(Clone, Debug, Copy, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AnimalAlreadyExists = 1,
    AnimalNotFound = 2,
    AlreadyVoted = 3,
    InvalidAnimalName = 4,
    Unauthorized = 5,
    AnimalNameTooLong = 6,
    AnimalNameEmpty = 7,
}

#[contract]
pub struct AnimalVotingContract;

#[contractimpl]
impl AnimalVotingContract {
    
    /// Kontratı başlatır ve admin'i ayarlar
    pub fn initialize(env: Env, admin: Address) {
        // Admin doğrulaması
        admin.require_auth();
        
        // Admin'i kaydet
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Toplam hayvan sayısını sıfırla
        env.storage().instance().set(&DataKey::TotalAnimals, &0u64);
        
        // Boş hayvan listesi oluştur
        let empty_animals: Vec<Animal> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Animals, &empty_animals);
        
        log!(&env, "Animal Voting Contract initialized with admin: {}", admin);
    }
    
    /// Yeni hayvan ekler
    pub fn add_animal(env: Env, user: Address, animal_name: String) -> Result<(), Error> {
        // Kullanıcı doğrulaması
        user.require_auth();
        
        // Hayvan adı validasyonu
        if animal_name.len() == 0 {
            return Err(Error::AnimalNameEmpty);
        }
        
        if animal_name.len() > 30 {
            return Err(Error::AnimalNameTooLong);
        }
        
        // Mevcut hayvanları al
        let mut animals: Vec<Animal> = env.storage()
            .instance()
            .get(&DataKey::Animals)
            .unwrap_or(Vec::new(&env));
        
        // Aynı isimde hayvan var mı kontrol et
        for animal in animals.iter() {
            if animal.name == animal_name {
                return Err(Error::AnimalAlreadyExists);
            }
        }
        
        // Yeni hayvan oluştur
        let new_animal = Animal {
            name: animal_name.clone(),
            votes: 0,
            creator: user.clone(),
        };
        
        // Hayvanı listeye ekle
        animals.push_back(new_animal);
        
        // Güncellenmiş listeyi kaydet
        env.storage().instance().set(&DataKey::Animals, &animals);
        
        // Hayvan için oy sayısını başlat
        env.storage().persistent().set(&DataKey::AnimalVotes(animal_name.clone()), &0u64);
        
        // Toplam hayvan sayısını artır
        let total_animals: u64 = env.storage()
            .instance()
            .get(&DataKey::TotalAnimals)
            .unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalAnimals, &(total_animals + 1));
        
        log!(&env, "Animal added: {} by {}", animal_name, user);
        Ok(())
    }
    
    /// Hayvana oy verir
    pub fn vote_for_animal(env: Env, user: Address, animal_name: String) -> Result<(), Error> {
        // Kullanıcı doğrulaması
        user.require_auth();
        
        // Hayvanın var olup olmadığını kontrol et
        let animals: Vec<Animal> = env.storage()
            .instance()
            .get(&DataKey::Animals)
            .unwrap_or(Vec::new(&env));
        
        let mut animal_exists = false;
        for animal in animals.iter() {
            if animal.name == animal_name {
                animal_exists = true;
                break;
            }
        }
        
        if !animal_exists {
            return Err(Error::AnimalNotFound);
        }
        
        // Kullanıcının bu hayvana daha önce oy verip vermediğini kontrol et
        let user_votes: Vec<String> = env.storage()
            .persistent()
            .get(&DataKey::UserVotes(user.clone()))
            .unwrap_or(Vec::new(&env));
        
        for voted_animal in user_votes.iter() {
            if voted_animal == animal_name {
                return Err(Error::AlreadyVoted);
            }
        }
        
        // Oy sayısını artır
        let current_votes: u64 = env.storage()
            .persistent()
            .get(&DataKey::AnimalVotes(animal_name.clone()))
            .unwrap_or(0);
        
        env.storage().persistent().set(&DataKey::AnimalVotes(animal_name.clone()), &(current_votes + 1));
        
        // Kullanıcının oy verdiği hayvanlar listesini güncelle
        let mut updated_user_votes = user_votes;
        updated_user_votes.push_back(animal_name.clone());
        env.storage().persistent().set(&DataKey::UserVotes(user.clone()), &updated_user_votes);
        
        // Hayvan listesindeki oy sayısını güncelle
        let mut updated_animals = animals;
        for i in 0..updated_animals.len() {
            if let Some(mut animal) = updated_animals.get(i) {
                if animal.name == animal_name {
                    animal.votes = current_votes + 1;
                    updated_animals.set(i, animal);
                    break;
                }
            }
        }
        env.storage().instance().set(&DataKey::Animals, &updated_animals);
        
        log!(&env, "Vote recorded: {} voted for {}", user, animal_name);
        Ok(())
    }
    
    /// Tüm hayvanları döndürür (oy sayısına göre sıralı)
    pub fn get_animals(env: Env) -> Vec<Animal> {
        let mut animals: Vec<Animal> = env.storage()
            .instance()
            .get(&DataKey::Animals)
            .unwrap_or(Vec::new(&env));
        
        // Oy sayısına göre sırala (bubble sort - Soroban'da sınırlı sorting seçenekleri)
        let len = animals.len();
        for i in 0..len {
            for j in 0..(len - i - 1) {
                if let (Some(animal_a), Some(animal_b)) = (animals.get(j), animals.get(j + 1)) {
                    if animal_a.votes < animal_b.votes {
                        // Swap
                        animals.set(j, animal_b);
                        animals.set(j + 1, animal_a);
                    }
                }
            }
        }
        
        animals
    }
    
    /// Belirli bir hayvanın oy sayısını döndürür
    pub fn get_animal_votes(env: Env, animal_name: String) -> Result<u64, Error> {
        let animals: Vec<Animal> = env.storage()
            .instance()
            .get(&DataKey::Animals)
            .unwrap_or(Vec::new(&env));
        
        for animal in animals.iter() {
            if animal.name == animal_name {
                let votes = env.storage()
                    .persistent()
                    .get(&DataKey::AnimalVotes(animal_name))
                    .unwrap_or(0);
                return Ok(votes);
            }
        }
        
        Err(Error::AnimalNotFound)
    }
    
    /// Kullanıcının oy verdiği hayvanları döndürür
    pub fn get_user_votes(env: Env, user: Address) -> Vec<String> {
        env.storage()
            .persistent()
            .get(&DataKey::UserVotes(user))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Kullanıcının belirli bir hayvana oy verip vermediğini kontrol eder
    pub fn has_user_voted(env: Env, user: Address, animal_name: String) -> bool {
        let user_votes: Vec<String> = env.storage()
            .persistent()
            .get(&DataKey::UserVotes(user))
            .unwrap_or(Vec::new(&env));
        
        for voted_animal in user_votes.iter() {
            if voted_animal == animal_name {
                return true;
            }
        }
        
        false
    }
    
    /// Toplam hayvan sayısını döndürür
    pub fn get_total_animals(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalAnimals)
            .unwrap_or(0)
    }
    
    /// Toplam oy sayısını döndürür
    pub fn get_total_votes(env: Env) -> u64 {
        let animals: Vec<Animal> = Self::get_animals(env.clone());
        let mut total_votes = 0u64;
        
        for animal in animals.iter() {
            total_votes += animal.votes;
        }
        
        total_votes
    }
    
    /// En çok oy alan hayvanı döndürür
    pub fn get_winner(env: Env) -> Option<Animal> {
        let animals = Self::get_animals(env);
        animals.first()
    }
    
    /// Kontrat admin'ini döndürür
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }
    
    /// Hayvan silme (sadece admin)
    pub fn remove_animal(env: Env, admin: Address, animal_name: String) -> Result<(), Error> {
        admin.require_auth();
        
        // Admin kontrolü
        let contract_admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::Unauthorized)?;
        
        if admin != contract_admin {
            return Err(Error::Unauthorized);
        }
        
        // Hayvan listesini al
        let mut animals: Vec<Animal> = env.storage()
            .instance()
            .get(&DataKey::Animals)
            .unwrap_or(Vec::new(&env));
        
        // Hayvanı bul ve kaldır
        let mut found = false;
        let mut new_animals = Vec::new(&env);
        
        for animal in animals.iter() {
            if animal.name != animal_name {
                new_animals.push_back(animal);
            } else {
                found = true;
            }
        }
        
        if !found {
            return Err(Error::AnimalNotFound);
        }
        
        // Güncellenmiş listeyi kaydet
        env.storage().instance().set(&DataKey::Animals, &new_animals);
        
        // Hayvan oy verilerini temizle
        env.storage().persistent().remove(&DataKey::AnimalVotes(animal_name.clone()));
        
        // Toplam hayvan sayısını azalt
        let total_animals: u64 = env.storage()
            .instance()
            .get(&DataKey::TotalAnimals)
            .unwrap_or(0);
        
        if total_animals > 0 {
            env.storage().instance().set(&DataKey::TotalAnimals, &(total_animals - 1));
        }
        
        log!(&env, "Animal removed: {} by admin {}", animal_name, admin);
        Ok(())
    }
    
    /// Kontrat istatistiklerini döndürür
    pub fn get_stats(env: Env) -> Map<String, u64> {
        let mut stats = Map::new(&env);
        
        stats.set(String::from_str(&env, "total_animals"), Self::get_total_animals(env.clone()));
        stats.set(String::from_str(&env, "total_votes"), Self::get_total_votes(env.clone()));
        
        // En çok oy alan hayvanın oy sayısı
        if let Some(winner) = Self::get_winner(env.clone()) {
            stats.set(String::from_str(&env, "highest_votes"), winner.votes);
        } else {
            stats.set(String::from_str(&env, "highest_votes"), 0);
        }
        
        stats
    }
}

// Test modülü
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let admin = Address::generate(&env);
        
        AnimalVotingContract::initialize(env.clone(), admin.clone());
        
        assert_eq!(AnimalVotingContract::get_admin(env.clone()), Some(admin));
        assert_eq!(AnimalVotingContract::get_total_animals(env), 0);
    }

    #[test]
    fn test_add_animal() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        AnimalVotingContract::initialize(env.clone(), admin);
        
        let result = AnimalVotingContract::add_animal(
            env.clone(), 
            user, 
            String::from_str(&env, "Aslan")
        );
        
        assert!(result.is_ok());
        assert_eq!(AnimalVotingContract::get_total_animals(env.clone()), 1);
        
        let animals = AnimalVotingContract::get_animals(env);
        assert_eq!(animals.len(), 1);
        assert_eq!(animals.first().unwrap().name, String::from_str(&env, "Aslan"));
    }

    #[test]
    fn test_vote_for_animal() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        
        AnimalVotingContract::initialize(env.clone(), admin);
        
        // Hayvan ekle
        AnimalVotingContract::add_animal(
            env.clone(), 
            user1.clone(), 
            String::from_str(&env, "Aslan")
        ).unwrap();
        
        // Oy ver
        let result = AnimalVotingContract::vote_for_animal(
            env.clone(), 
            user2, 
            String::from_str(&env, "Aslan")
        );
        
        assert!(result.is_ok());
        
        let votes = AnimalVotingContract::get_animal_votes(
            env, 
            String::from_str(&env, "Aslan")
        ).unwrap();
        
        assert_eq!(votes, 1);
    }

    #[test]
    fn test_duplicate_vote() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        
        AnimalVotingContract::initialize(env.clone(), admin);
        
        // Hayvan ekle
        AnimalVotingContract::add_animal(
            env.clone(), 
            user1, 
            String::from_str(&env, "Aslan")
        ).unwrap();
        
        // İlk oy
        AnimalVotingContract::vote_for_animal(
            env.clone(), 
            user2.clone(), 
            String::from_str(&env, "Aslan")
        ).unwrap();
        
        // İkinci oy (hata vermeli)
        let result = AnimalVotingContract::vote_for_animal(
            env, 
            user2, 
            String::from_str(&env, "Aslan")
        );
        
        assert_eq!(result, Err(Error::AlreadyVoted));
    }
}