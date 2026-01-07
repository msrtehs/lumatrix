
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  getDoc,
  Timestamp,
  setDoc,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { Property, ChatRoom } from "../types";

export const firebaseService = {
  // --- Imóveis ---
  async getProperties(): Promise<Property[]> {
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      return [];
    }
  },

  async getPropertiesByUser(userId: string): Promise<Property[]> {
    try {
      const q = query(
        collection(db, "properties"), 
        where("sellerId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      console.error("Erro ao buscar imóveis do usuário:", error);
      return [];
    }
  },

  async addProperty(propertyData: Omit<Property, 'id'>, imageFiles: File[]): Promise<string> {
    try {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        })
      );

      const docRef = await addDoc(collection(db, "properties"), {
        ...propertyData,
        images: imageUrls,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar imóvel:", error);
      throw error;
    }
  },

  // --- Chats ---
  async getMyChats(userId: string): Promise<ChatRoom[]> {
    try {
      const q = query(
        collection(db, "chats"), 
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      return [];
    }
  },

  async startChat(property: Property, buyerId: string): Promise<string> {
    try {
      // Verifica se já existe um chat entre os dois para este imóvel
      const q = query(
        collection(db, "chats"),
        where("propertyId", "==", property.id),
        where("participants", "array-contains", buyerId)
      );
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants.includes(property.sellerId));
      
      if (existing) return existing.id;

      const newChat = await addDoc(collection(db, "chats"), {
        propertyId: property.id,
        propertyTitle: property.title,
        participants: [buyerId, property.sellerId],
        updatedAt: Timestamp.now(),
        lastMessage: "Olá, tenho interesse neste imóvel."
      });
      return newChat.id;
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      throw error;
    }
  },

  // --- Usuários ---
  async saveUser(userData: { uid: string, name: string, email: string, phone?: string }) {
    try {
      const userRef = doc(db, "users", userData.uid);
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  },

  async getUserData(uid: string) {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      return null;
    }
  }
};
