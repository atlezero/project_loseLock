'use client';
import { AuthProvider } from '../context/AuthContext';
import { LockerProvider } from '../context/LockerContext';
import { ChatProvider } from '../context/ChatContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LockerProvider>
                <ChatProvider>
                    {children}
                </ChatProvider>
            </LockerProvider>
        </AuthProvider>
    );
}
