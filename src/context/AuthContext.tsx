'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    auth,
    firestore,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    doc,
    getDoc,
    setDoc,
    FirebaseUser
} from '../lib/firebase';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser && firestore) {
                try {
                    // Sync/Fetch Profile
                    const docRef = doc(firestore, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProfile(docSnap.data() as UserProfile);
                    } else {
                        // If no profile (e.g. created via other means), create default
                        const newProfile = {
                            id: currentUser.uid,
                            email: currentUser.email || '',
                            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                            uid: currentUser.uid,
                            lastLogin: new Date()
                        };
                        await setDoc(docRef, newProfile, { merge: true });
                        setProfile({ id: newProfile.id, email: newProfile.email, name: newProfile.name });
                    }
                } catch (e) {
                    console.error("Error fetching profile:", e);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        if (!auth) return false;
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (e: any) {
            setError(e.message);
            return false;
        }
    };

    const register = async (email: string, password: string, name: string) => {
        if (!auth) return false;
        setError(null);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            if (firestore && cred.user) {
                // Create Profile immediately
                const newProfile = {
                    id: cred.user.uid,
                    email: email,
                    name: name || email.split('@')[0],
                    uid: cred.user.uid,
                    createdAt: new Date(),
                    lastLogin: new Date()
                };
                await setDoc(doc(firestore, 'users', cred.user.uid), newProfile);
                setProfile({ id: newProfile.id, email: newProfile.email, name: newProfile.name });
            }
            return true;
        } catch (e: any) {
            setError(e.message);
            return false;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            setProfile(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, register, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
