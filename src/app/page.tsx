'use client';
import AuthGuard from '../components/Auth/AuthGuard';
import { useLockers } from '../context/LockerContext';
import { theme } from '../lib/theme';

export default function HomePage() {
  const { lockers, loading, resetSystem } = useLockers();

  return (
    <AuthGuard>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <h2>🏢 ระบบตู้ล็อกเกอร์อัจฉริยะ</h2>
        <p style={{ color: '#666', marginBottom: 40 }}>ฝากของ, ค้นหา, แชทกับผู้ฝาก, และรับของผ่านระบบ OTP</p>

        {loading ? (
          <div>Using Locker Data...</div>
        ) : (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {lockers.map(l => (
              <div key={l.id} style={{
                width: 140,
                height: 180,
                background: l.status === 'available' ? theme.white : theme.yellow,
                color: theme.black,
                border: `2px solid ${l.status === 'available' ? theme.border : theme.yellow}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: theme.radius.lg,
                flexDirection: 'column',
                boxShadow: l.status === 'available' ? 'none' : '0 10px 30px rgba(255, 215, 0, 0.3)',
                transition: '0.2s',
                position: 'relative'
              }}>
                <strong style={{ fontSize: 32 }}>{l.id}</strong>
                <span style={{ fontSize: 13, marginTop: 10, fontWeight: 500 }}>{l.status === 'available' ? 'ว่าง' : 'มีของ'}</span>
                {l.item && (
                  <div style={{ marginTop: 5, fontSize: 12, opacity: 0.8, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 60, borderTop: `1px solid ${theme.border}`, paddingTop: 30 }}>
          <button onClick={resetSystem} style={{ background: theme.black, color: theme.white, padding: '12px 24px', border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 600 }}>
            ⚠️ ล้างระบบ (Reset Database)
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}