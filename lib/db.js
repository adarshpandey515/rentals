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
        console.time("DB: inventory.getAll");
        const q = query(collection(db, "inventory"), orderBy("name"));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: inventory.getAll");
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async add(item) {
        console.time("DB: inventory.add");
        const res = await addDoc(collection(db, "inventory"), {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.timeEnd("DB: inventory.add");
        return res;
    },
    async update(id, updates) {
        console.time("DB: inventory.update");
        const docRef = doc(db, "inventory", id);
        const res = await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        console.timeEnd("DB: inventory.update");
        return res;
    },
    async delete(id) {
        console.time("DB: inventory.delete");
        const res = await deleteDoc(doc(db, "inventory", id));
        console.timeEnd("DB: inventory.delete");
        return res;
    }
};

// Rentals Operations
export const rentalActions = {
    async getAll() {
        console.time("DB: rentals.getAll");
        const q = query(collection(db, "rentals"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: rentals.getAll");
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async create(rental) {
        console.time("DB: rentals.create");
        const res = await addDoc(collection(db, "rentals"), {
            ...rental,
            status: "booked",
            createdAt: serverTimestamp(),
        });
        console.timeEnd("DB: rentals.create");
        return res;
    },
    async delete(id) {
        console.time("DB: rentals.delete");
        const res = await deleteDoc(doc(db, "rentals", id));
        console.timeEnd("DB: rentals.delete");
        return res;
    },
    async getStats() {
        console.time("DB: rentals.getStats");
        const q = query(collection(db, "rentals"));
        const snapshot = await getDocs(q);
        const rentals = snapshot.docs.map(doc => doc.data());
        console.timeEnd("DB: rentals.getStats");

        return {
            active: rentals.filter(r => r.status === "Active").length,
            dueToday: rentals.filter(r => r.status === "Active" && r.dor === new Date().toISOString().split('T')[0]).length,
            pendingPayments: rentals.reduce((sum, r) => sum + (Number(r.due) || 0), 0),
            revenue: rentals.reduce((sum, r) => sum + (Number(r.total) || 0), 0),
        };
    },
    async getRecent() {
        console.time("DB: rentals.getRecent");
        const q = query(collection(db, "rentals"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: rentals.getRecent");
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// Payments Operations
export const paymentActions = {
    async getAll() {
        console.time("DB: payments.getAll");
        const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: payments.getAll");
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async add(payment) {
        console.time("DB: payments.add");
        const res = await addDoc(collection(db, "payments"), {
            ...payment,
            createdAt: serverTimestamp(),
        });
        console.timeEnd("DB: payments.add");
        return res;
    }
};

// Clients Operations
export const clientActions = {
    async getAll() {
        console.time("DB: clients.getAll");
        const q = query(collection(db, "clients"), orderBy("name"));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: clients.getAll");
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async add(client) {
        console.time("DB: clients.add");
        const res = await addDoc(collection(db, "clients"), {
            ...client,
            dues: 0,
            createdAt: serverTimestamp(),
        });
        console.timeEnd("DB: clients.add");
        return res;
    },
    async getByName(name) {
        console.time("DB: clients.getByName");
        const q = query(collection(db, "clients"), where("name", "==", name));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: clients.getByName");
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
};

// Settings Operations
export const settingsActions = {
    async get() {
        console.time("DB: settings.get");
        const q = query(collection(db, "settings"), limit(1));
        const snapshot = await getDocs(q);
        console.timeEnd("DB: settings.get");
        if (snapshot.empty) return {
            businessName: "LightBill Pro Rentals",
            gst: "27AAAAA0000A1Z5",
            address: "Studio 4, Filmcity, Goregaon East, Mumbai, Maharashtra 400065",
            senderEmail: ""
        };
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    async update(id, updates) {
        console.time("DB: settings.update");
        const docRef = doc(db, "settings", id || "general");
        // If id is "general" and it doesn't exist, we might need to use setDoc, 
        // but for simplicity with our current structure, let's just use a fixed ID.
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
        console.timeEnd("DB: settings.update");
        return res;
    }
};
