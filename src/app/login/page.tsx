'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../lib/theme';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, register, user, loading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);
        let success = false;
        if (mode === 'login') {
            success = await login(form.email, form.password);
        } else {
            success = await register(form.email, form.password, form.name);
        }
        setIsSubmitting(false);
        // If success, useEffect will redirect
        if (!success) setError('ดำเนินการไม่สำเร็จ โปรดตรวจสอบข้อมูล');
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>⏳ Loading...</div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.gray,
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                background: theme.white,
                padding: 40,
                borderRadius: theme.radius.lg,
                boxShadow: theme.shadow,
                width: '100%',
                maxWidth: 400,
                border: `1px solid ${theme.border}`
            }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>📦</div>
                    <h1 style={{ margin: 0, fontSize: 24, color: theme.text }}>Smart Locker</h1>
                    <p style={{ color: '#6c757d', marginTop: 5 }}>ระบบตู้ล็อกเกอร์อัจฉริยะ</p>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{mode === 'login' ? '🔐 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}</h2>

                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 8, marginBottom: 15, fontSize: 14, textAlign: 'center' }}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {mode === 'register' && (
                        <input
                            placeholder="ชื่อของคุณ"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 16, outline: 'none' }}
                        />
                    )}
                    <input
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={{ padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 16, outline: 'none' }}
                    />
                    <input
                        placeholder="รหัสผ่าน"
                        type="password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        style={{ padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 16, outline: 'none' }}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                            padding: 16,
                            background: theme.yellow,
                            color: theme.black,
                            border: 'none',
                            borderRadius: theme.radius.pill,
                            fontSize: 16,
                            fontWeight: 800,
                            cursor: isSubmitting ? 'wait' : 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                            marginTop: 10
                        }}
                    >
                        {isSubmitting ? '⏳ กำลังดำเนินการ...' : (mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
                    {mode === 'login' ? (
                        <span>ยังไม่มีบัญชี? <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>สมัครสมาชิก</button></span>
                    ) : (
                        <span>มีบัญชีแล้ว? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>เข้าสู่ระบบ</button></span>
                    )}
                </div>
            </div>
        </div>
    );
}
