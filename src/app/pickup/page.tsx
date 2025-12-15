'use client';
import { useState } from 'react';
import { useLockers } from '../../context/LockerContext';
import { theme } from '../../lib/theme';

export default function PickupPage() {
    const { pickupItem } = useLockers();
    const [lockerId, setLockerId] = useState('');
    const [otp, setOtp] = useState('');

    const handlePickup = async () => {
        if (!lockerId || !otp) return alert('กรุณากรอกข้อมูล');
        const success = await pickupItem(parseInt(lockerId), otp);
        if (success) {
            alert('✅ รับของสำเร็จ! ตู้เปิดแล้ว');
            setLockerId('');
            setOtp('');
        } else {
            alert('❌ รหัส OTP ไม่ถูกต้อง หรือตู้ผิด');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <h2>🔢 รับของ (Kiosk / OTP)</h2>
            <div style={{ background: theme.white, padding: 30, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <input
                    placeholder="หมายเลขตู้ (เช่น 101)"
                    type="number"
                    value={lockerId}
                    onChange={e => setLockerId(e.target.value)}
                    style={{ width: '100%', padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 18, marginBottom: 15, outline: 'none', textAlign: 'center' }}
                />
                <input
                    placeholder="รหัส OTP 4 หลัก"
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    style={{ width: '100%', padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 24, marginBottom: 20, outline: 'none', textAlign: 'center', letterSpacing: 5 }}
                />
                <button onClick={handlePickup} style={{ width: '100%', padding: 16, background: theme.yellow, color: theme.black, border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 800, fontSize: 18, boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)' }}>
                    🔓 เปิดตู้
                </button>
            </div>
        </div>
    );
}
