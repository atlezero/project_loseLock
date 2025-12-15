'use client';
import { useLockers } from '../../context/LockerContext';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../lib/theme';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const { lockers, requestItem } = useLockers();
    const { user } = useAuth();
    const router = useRouter();

    const handleRequest = async (id: number, depositorBy: string | null) => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (depositorBy === user.uid) return alert('ไม่สามารถขอของตัวเองได้');

        await requestItem(id);
        alert('✅ ส่งคำขอแล้ว โปรดรอการอนุมัติ');
    };

    const occupiedLockers = lockers.filter(l => l.status === 'occupied' && l.requestStatus !== 'approved');

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2>🔎 ค้นหาของหาย</h2>

            {!user && (
                <div style={{ padding: 15, background: '#fff3cd', color: '#856404', borderRadius: theme.radius.md, marginBottom: 20 }}>
                    ⚠️ กรุณา <span onClick={() => router.push('/login')} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>เข้าสู่ระบบ</span> เพื่อติดต่อผู้ฝาก
                </div>
            )}

            {occupiedLockers.length === 0 ? <p>ไม่พบรายการของหาย</p> : occupiedLockers.map(l => (
                <div key={l.id} style={{
                    background: theme.white,
                    padding: 24,
                    borderRadius: theme.radius.lg,
                    border: `1px solid ${theme.border}`,
                    marginBottom: 16,
                    boxShadow: theme.shadow
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>{l.item?.name}</h3>
                            <p style={{ color: '#666', margin: 0 }}>🏷️ {l.item?.tags?.join(', ')}</p>
                            <small style={{ color: '#999' }}>ตู้ {l.id} | ฝากเมื่อ: {l.depositedAt?.toLocaleString()}</small>
                        </div>
                        <div>
                            {l.requestStatus === 'pending' ? (
                                <span style={{ background: theme.yellow, color: theme.black, padding: '8px 15px', borderRadius: theme.radius.pill, fontWeight: 600 }}>⏳ รออนุมัติ</span>
                            ) : (
                                <button
                                    onClick={() => handleRequest(l.id, l.depositorBy)}
                                    disabled={!user || l.depositorBy === user.uid}
                                    style={{
                                        background: user && l.depositorBy !== user.uid ? theme.black : '#e0e0e0',
                                        color: theme.white,
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: theme.radius.pill,
                                        cursor: user && l.depositorBy !== user.uid ? 'pointer' : 'not-allowed',
                                        fontWeight: 600
                                    }}
                                >
                                    ✋ ขอรับของเรียบร้อยแล้ว
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
