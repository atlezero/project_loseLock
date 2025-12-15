'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { firestore, db, collection, onSnapshot, doc, setDoc, updateDoc } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface Locker {
    id: number;
    status: 'available' | 'occupied';
    item: { name: string; img?: string; tags?: string[] } | null;
    depositorBy: string | null;
    depositedAt: Date | null;
    requestStatus: 'pending' | 'approved' | null;
    otp: string | null;
}

interface LockerContextType {
    lockers: Locker[];
    loading: boolean;
    depositItem: (id: number, data: { name: string, img: string, tags: string[] }) => Promise<void>;
    requestItem: (id: number) => Promise<void>;
    approveRequest: (id: number) => Promise<string>; // Returns OTP
    pickupItem: (id: number, otp: string) => Promise<boolean>;
    resetSystem: () => Promise<void>;
}

const LockerContext = createContext<LockerContextType>({} as LockerContextType);

export const LockerProvider = ({ children }: { children: ReactNode }) => {
    const [lockers, setLockers] = useState<Locker[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth(); // Need current user for actions

    // Load Lockers
    useEffect(() => {
        if (!firestore) {
            setLoading(false);
            return;
        }
        const lockersRef = collection(firestore, 'lockers');
        const unsubscribe = onSnapshot(lockersRef, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    ...d,
                    id: parseInt(doc.id),
                    depositedAt: d.depositedAt ? d.depositedAt.toDate() : null
                } as Locker;
            });
            // Sort by ID
            data.sort((a, b) => a.id - b.id);

            // If empty (first run), initialize default
            if (data.length === 0) {
                // handleResetSystem(); // Optional: Auto-init
                setLockers([101, 102, 103, 104].map(id => ({ id, status: 'available', item: null, depositorBy: null, depositedAt: null, requestStatus: null, otp: null })));
            } else {
                setLockers(data);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const depositItem = async (id: number, data: { name: string, img: string, tags: string[] }) => {
        if (!firestore || !profile) return;
        const ref = doc(firestore, 'lockers', id.toString());
        await setDoc(ref, {
            id,
            status: 'occupied',
            item: data,
            depositorBy: profile.id,
            depositedAt: new Date(),
            requestStatus: null,
            otp: null
        }, { merge: true });
    };

    const requestItem = async (id: number) => {
        if (!firestore || !profile) return;
        const locker = lockers.find(l => l.id === id);
        if (!locker || locker.depositorBy === profile.id) return; // Prevent self-request

        const ref = doc(firestore, 'lockers', id.toString());
        await updateDoc(ref, { requestStatus: 'pending' });
        // Note: Chat notification should be handled by the UI/Component calling this, or here if we move ChatContext
    };

    const approveRequest = async (id: number) => {
        if (!firestore) return '';
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const ref = doc(firestore, 'lockers', id.toString());
        await updateDoc(ref, { requestStatus: 'approved', otp });
        return otp;
    };

    const pickupItem = async (id: number, otp: string) => {
        const locker = lockers.find(l => l.id === id);
        if (!locker || locker.otp !== otp) return false;

        if (!firestore) return false;
        const ref = doc(firestore, 'lockers', id.toString());
        // Reset
        await setDoc(ref, {
            id,
            status: 'available',
            item: null,
            depositorBy: null,
            depositedAt: null,
            requestStatus: null,
            otp: null
        });
        return true;
    };

    const resetSystem = async () => {
        if (!firestore) return;
        const defaultLockers = [101, 102, 103, 104];
        for (const id of defaultLockers) {
            await setDoc(doc(firestore, 'lockers', id.toString()), {
                id,
                status: 'available',
                item: null,
                depositorBy: null,
                depositedAt: null,
                requestStatus: null,
                otp: null
            });
        }
    };

    return (
        <LockerContext.Provider value={{ lockers, loading, depositItem, requestItem, approveRequest, pickupItem, resetSystem }}>
            {children}
        </LockerContext.Provider>
    );
};

export const useLockers = () => useContext(LockerContext);
