'use client';
import { useState, useEffect, useCallback } from 'react';
import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    FirebaseUser
} from '../lib/firebase';

interface AuthState {
    user: FirebaseUser | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null
    });

    // Listen for auth state changes
    useEffect(() => {
        if (!auth) {
            setAuthState(prev => ({ ...prev, loading: false }));
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthState({
                user,
                loading: false,
                error: null
            });
        });

        return () => unsubscribe();
    }, []);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        if (!auth) {
            setAuthState(prev => ({ ...prev, error: 'Firebase Auth not available' }));
            return false;
        }

        setAuthState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error: unknown) {
            const err = error as { code?: string; message?: string };
            let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ';

            if (err.code === 'auth/user-not-found') {
                errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'รหัสผ่านไม่ถูกต้อง';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
            } else if (err.code === 'auth/invalid-credential') {
                errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            }

            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return false;
        }
    }, []);

    // Register function  
    const register = useCallback(async (email: string, password: string) => {
        if (!auth) {
            setAuthState(prev => ({ ...prev, error: 'Firebase Auth not available' }));
            return false;
        }

        setAuthState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error: unknown) {
            const err = error as { code?: string; message?: string };
            let errorMessage = 'สมัครสมาชิกไม่สำเร็จ';

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
            }

            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return false;
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        if (!auth) return;

        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return {
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        login,
        register,
        logout,
        clearError: () => setAuthState(prev => ({ ...prev, error: null }))
    };
}
