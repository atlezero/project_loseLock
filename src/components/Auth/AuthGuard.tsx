'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { theme } from '../../lib/theme';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div style={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme.text }}>
            ⏳ Loading...
        </div>
    );

    if (!user) return null;
    return <>{children}</>;
}
