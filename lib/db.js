import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit
} from "firebase/firestore";

// Inventory Operations
export const inventoryActions = {
    async getAll() {
        try {
            const q = query(collection(db, "inventory"), orderBy("name"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching inventory:", error);
            return [];
        }
    },
    async add(item) {
        try {
            const res = await addDoc(collection(db, "inventory"), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return res;
        } catch (error) {
            console.error("Error adding inventory item:", error);
            throw error;
        }
    },
    async update(id, updates) {
        try {
            const docRef = doc(db, "inventory", id);
            const res = await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });
            return res;
        } catch (error) {
            console.error("Error updating inventory item:", error);
            throw error;
        }
    },
    async delete(id) {
        try {
            const res = await deleteDoc(doc(db, "inventory", id));
            return res;
        } catch (error) {
            console.error("Error deleting inventory item:", error);
            throw error;
        }
    }
};

// Rentals Operations
export const rentalActions = {
    async getAll() {
        try {
            const q = query(collection(db, "rentals"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching rentals:", error);
            return [];
        }
    },
    async create(rental) {
        try {
            const res = await addDoc(collection(db, "rentals"), {
                ...rental,
                status: "booked",
                createdAt: serverTimestamp(),
            });
            return res;
        } catch (error) {
            console.error("Error creating rental:", error);
            throw error;
        }
    },
    async delete(id) {
        try {
            const res = await deleteDoc(doc(db, "rentals", id));
            return res;
        } catch (error) {
            console.error("Error deleting rental:", error);
            throw error;
        }
    },
    async getStats() {
        try {
            const q = query(
                collection(db, "rentals"),
                limit(1000) // Limit to prevent fetching massive datasets
            );
            const snapshot = await getDocs(q);
            const rentals = snapshot.docs.map(doc => doc.data());
            
            return {
                active: rentals.filter(r => r.status === "Active").length,
                dueToday: rentals.filter(r => r.status === "Active" && r.dor === new Date().toISOString().split('T')[0]).length,
                pendingPayments: rentals.reduce((sum, r) => sum + (Number(r.due) || 0), 0),
                revenue: rentals.reduce((sum, r) => sum + (Number(r.total) || 0), 0),
            };
        } catch (error) {
            console.error("Error fetching rental stats:", error);
            return {
                active: 0,
                dueToday: 0,
                pendingPayments: 0,
                revenue: 0,
            };
        }
    },
    async getRecent() {
        try {
            const q = query(
                collection(db, "rentals"),
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching recent rentals:", error);
            return [];
        }
    }
};

// Payments Operations
export const paymentActions = {
    async getAll() {
        try {
            const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching payments:", error);
            return [];
        }
    },
    async add(payment) {
        try {
            const res = await addDoc(collection(db, "payments"), {
                ...payment,
                createdAt: serverTimestamp(),
            });
            return res;
        } catch (error) {
            console.error("Error adding payment:", error);
            throw error;
        }
    }
};

// Clients Operations
export const clientActions = {
    async getAll() {
        try {
            const q = query(collection(db, "clients"), orderBy("name"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching clients:", error);
            return [];
        }
    },
    async add(client) {
        try {
            const res = await addDoc(collection(db, "clients"), {
                ...client,
                dues: 0,
                createdAt: serverTimestamp(),
            });
            return res;
        } catch (error) {
            console.error("Error adding client:", error);
            throw error;
        }
    },
    async getByName(name) {
        try {
            const q = query(collection(db, "clients"), where("name", "==", name));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            console.error("Error fetching client by name:", error);
            return null;
        }
    }
};

// Settings Operations
export const settingsActions = {
    async get() {
        try {
            const q = query(collection(db, "settings"), limit(1));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return {
                businessName: "LightBill Pro Rentals",
                gst: "27AAAAA0000A1Z5",
                address: "Studio 4, Filmcity, Goregaon East, Mumbai, Maharashtra 400065",
                senderEmail: ""
            };
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            console.error("Error fetching settings:", error);
            return {
                businessName: "LightBill Pro Rentals",
                gst: "27AAAAA0000A1Z5",
                address: "Studio 4, Filmcity, Goregaon East, Mumbai, Maharashtra 400065",
                senderEmail: ""
            };
        }
    },
    async update(id, updates) {
        try {
            const docRef = doc(db, "settings", id || "general");
            const res = await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            }).catch(async (err) => {
                if (err.code === 'not-found') {
                    const { setDoc } = await import("firebase/firestore");
                    return await setDoc(docRef, {
                        ...updates,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                }
                throw err;
            });
            return res;
        } catch (error) {
            console.error("Error updating settings:", error);
            throw error;
        }
    }
};
