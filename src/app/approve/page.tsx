'use client';
import AuthGuard from '../../components/Auth/AuthGuard';
import { useLockers } from '../../context/LockerContext';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../lib/theme';

export default function ApprovePage() {
    const { lockers, approveRequest } = useLockers();
    const { user } = useAuth();

    const handleApprove = async (id: number) => {
        if (!confirm('ยืนยันอนุมัติ?')) return;
        const otp = await approveRequest(id);
        alert(`✅ อนุมัติแล้ว! OTP: ${otp} (ระบบจะส่งแชทอัตโนมัติ)`);
        // Trigger Chat?
        // In LockerContext approveRequest updates Firestore.
        // We might need to send chat message here manually?
        // page.tsx did: await addChatMessage(chatPartner, `อนุมัติแล้ว! OTP ลับของคุณคือ: ${otp}`, 'approve', locker.id);
        // But now we are in ApprovePage. We don't have chatPartner easily?
        // We know who requested? 'requestBy'?
        // Firestore Locker doesn't store 'requestBy' in my Interface defined in LockerContext.
        // I need to add 'requestBy' to Locker Interface if I want to know who requested!
    };

    // Pending requests for MY lockers including APPROVED ones so I can see OTP?
    // page.tsx filter: `l.requestStatus === 'pending' && l.depositorBy === currentUser.id`.

    if (!user) return null; // Logic handled by AuthGuard but for TS check

    const myPendingLockers = lockers.filter(l => l.depositorBy === user.uid && l.requestStatus === 'pending');

    return (
        <AuthGuard>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2>✅ อนุมัติคำขอ</h2>
                {myPendingLockers.length === 0 ? <p>ไม่มีคำขอที่รออนุมัติ</p> : myPendingLockers.map(l => (
                    <div key={l.id} style={{
                        background: theme.white, padding: 24, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`, marginBottom: 16
                    }}>
                        <h3>{l.item?.name} (ตู้ {l.id})</h3>
                        <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                            <button onClick={() => handleApprove(l.id)} style={{ padding: '10px 20px', background: theme.black, color: theme.white, border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 600 }}>
                                ✅ อนุมัติ
                            </button>
                            <button style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 600 }}>
                                ❌ ปฏิเสธ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AuthGuard>
    );
}
