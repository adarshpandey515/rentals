import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

// ============= COMPANY SERVICES =============
export const companyService = {
  async addCompany(data) {
    try {
      const docRef = await addDoc(collection(db, 'companies'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding company:', error);
      throw error;
    }
  },

  async updateCompany(id, data) {
    try {
      await updateDoc(doc(db, 'companies', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  async deleteCompany(id) {
    try {
      await deleteDoc(doc(db, 'companies', id));
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  async getAllCompanies() {
    try {
      const querySnapshot = await getDocs(collection(db, 'companies'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async getCompanyById(id) {
    try {
      const docSnap = await getDoc(doc(db, 'companies', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },
};

// ============= CLIENT SERVICES =============
export const clientService = {
  async addClient(data) {
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  async updateClient(id, data) {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  async deleteClient(id) {
    try {
      await deleteDoc(doc(db, 'clients', id));
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  async getAllClients() {
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getClientById(id) {
    try {
      const docSnap = await getDoc(doc(db, 'clients', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },
};

// ============= INVENTORY SERVICES =============
export const inventoryService = {
  async addItem(data) {
    try {
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  },

  async updateItem(id, data) {
    try {
      await updateDoc(doc(db, 'inventory', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  async deleteItem(id) {
    try {
      await deleteDoc(doc(db, 'inventory', id));
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  async getAllItems() {
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  async getItemById(id) {
    try {
      const docSnap = await getDoc(doc(db, 'inventory', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },
};

// ============= RENTAL SERVICES =============
export const rentalService = {
  async addRental(data) {
    try {
      const docRef = await addDoc(collection(db, 'rentals'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding rental:', error);
      throw error;
    }
  },

  async updateRental(id, data) {
    try {
      await updateDoc(doc(db, 'rentals', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating rental:', error);
      throw error;
    }
  },

  async deleteRental(id) {
    try {
      await deleteDoc(doc(db, 'rentals', id));
      return true;
    } catch (error) {
      console.error('Error deleting rental:', error);
      throw error;
    }
  },

  async getAllRentals() {
    try {
      const querySnapshot = await getDocs(collection(db, 'rentals'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching rentals:', error);
      throw error;
    }
  },

  async getRentalById(id) {
    try {
      const docSnap = await getDoc(doc(db, 'rentals', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching rental:', error);
      throw error;
    }
  },

  async getRentalsByClient(clientId) {
    try {
      const q = query(collection(db, 'rentals'), where('clientId', '==', clientId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching client rentals:', error);
      throw error;
    }
  },
};

// ============= INVOICE SERVICES =============
export const invoiceService = {
  async addInvoice(data) {
    try {
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  },

  async updateInvoice(id, data) {
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async deleteInvoice(id) {
    try {
      await deleteDoc(doc(db, 'invoices', id));
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  async getAllInvoices() {
    try {
      const querySnapshot = await getDocs(collection(db, 'invoices'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async getInvoiceById(id) {
    try {
      const docSnap = await getDoc(doc(db, 'invoices', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  async getInvoicesByRental(rentalId) {
    try {
      const q = query(collection(db, 'invoices'), where('rentalId', '==', rentalId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching rental invoices:', error);
      throw error;
    }
  },
};
