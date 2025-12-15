'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { theme } from '../../lib/theme';
import { db, firestore } from '../../lib/firebase';

export default function Header() {
    const { user, logout, profile } = useAuth();
    const { unreadCount, isOpen, setIsOpen } = useChat();
    const pathname = usePathname();

    if (!user) return null; // Don't show header on Login page (handled by layout logic usually, or just return null here)

    const links = [
        { href: '/', label: '🏠 หน้าแรก' },
        { href: '/deposit', label: '1️⃣ ฝากของ' },
        { href: '/search', label: '2️⃣ ค้นหาของ' },
        { href: '/approve', label: '3️⃣ อนุมัติ' },
        { href: '/pickup', label: '4️⃣ รับของ' },
        { href: '/admin', label: '🧹 Admin' }
    ];

    const activeStyle = {
        background: theme.yellow,
        color: theme.black,
        fontWeight: 700,
        border: 'none',
        boxShadow: '0 4px 10px rgba(255, 215, 0, 0.4)'
    };

    const linkStyle = {
        padding: '10px 16px',
        borderRadius: theme.radius.pill,
        textDecoration: 'none',
        color: theme.text,
        border: `1px solid ${theme.border}`,
        transition: '0.2s',
        fontSize: 14,
        fontWeight: 500
    };

    return (
        <header style={{
            background: theme.white,
            borderBottom: `1px solid ${theme.border}`,
            padding: '16px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <h1 style={{ margin: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                    📦 Smart Locker
                    <span style={{
                        fontSize: 10,
                        color: db && firestore ? theme.success : theme.error,
                        background: db && firestore ? '#e6f4ea' : '#fce8e6',
                        padding: '2px 8px', borderRadius: 10, letterSpacing: 1, fontWeight: 'bold'
                    }}>
                        {db && firestore ? '● ONLINE' : '○ OFFLINE'}
                    </span>
                </h1>

                <nav style={{ display: 'flex', gap: 10, marginLeft: 20 }}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} style={{
                            ...linkStyle,
                            ...(pathname === l.href ? activeStyle : {})
                        }}>
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                {/* Use Profile & Logout */}
                <div style={{ textAlign: 'right', fontSize: 14 }}>
                    <div style={{ fontWeight: 'bold' }}>{profile?.name || user.email}</div>
                    <button
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', padding: 0, fontSize: 12, textDecoration: 'underline' }}
                    >
                        ออกจากระบบ
                    </button>
                </div>

                {/* Chat Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: theme.black,
                        color: theme.white,
                        border: 'none',
                        borderRadius: theme.radius.pill,
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    💬 แชท
                    {unreadCount > 0 && (
                        <span style={{ background: theme.error, color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: 11 }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
