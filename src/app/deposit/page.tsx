'use client';
import { useState } from 'react';
import AuthGuard from '../../components/Auth/AuthGuard';
import { useLockers } from '../../context/LockerContext';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../lib/theme';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRouter } from 'next/navigation';

export default function DepositPage() {
    const { lockers, depositItem } = useLockers();
    const { user } = useAuth();
    const router = useRouter();

    const [lockerId, setLockerId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', img: '', aiTags: [] as string[] });

    const handleAIExtract = async () => {
        if (!form.img) return alert('กรุณาใส่ URL รูปภาพ');
        try {
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Fetch image
            const response = await fetch(form.img);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const imagePart = {
                inlineData: {
                    data: base64.split(',')[1],
                    mimeType: blob.type
                }
            };

            const result = await model.generateContent([
                "Analyze this image and return a JSON object with 'name' (short thai name) and 'tags' (array of thai strings, max 3). Only JSON.",
                imagePart
            ]);
            const text = result.response.text();
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());

            setForm({ ...form, name: json.name, aiTags: json.tags });
        } catch (e) {
            console.error(e);
            alert('AI extract failed. Try manual input.');
        }
    };

    const handleSubmit = async () => {
        if (!lockerId || !form.name) return alert('กรุณากรอกข้อมูลให้ครบ');
        if (!user) return;
        await depositItem(lockerId, { name: form.name, img: form.img, tags: form.aiTags }); // depositItem signature needs checking from LockerContext
        alert('✅ ฝากของสำเร็จ!');
        router.push('/');
    };

    return (
        <AuthGuard>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2>📦 ฝากของ</h2>

                {!lockerId ? (
                    <div>
                        <p>เลือกตู้ว่างที่ต้องการฝาก:</p>
                        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                            {lockers.filter(l => l.status === 'available').map(l => (
                                <div key={l.id}
                                    onClick={() => setLockerId(l.id)}
                                    style={{
                                        width: 100, height: 100,
                                        border: `2px solid ${theme.border}`,
                                        borderRadius: theme.radius.md,
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        cursor: 'pointer',
                                        background: theme.white,
                                        fontSize: 24, fontWeight: 'bold'
                                    }}>
                                    {l.id}
                                </div>
                            ))}
                            {lockers.filter(l => l.status === 'available').length === 0 && <p>❌ ไม่มีตู้ว่างขณะนี้</p>}
                        </div>
                    </div>
                ) : (
                    <div style={{ background: theme.white, padding: 30, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}` }}>
                        <button onClick={() => setLockerId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>← เลือกตู้ใหม่ (ตู้ {lockerId})</button>

                        <h3 style={{ marginTop: 0 }}>รายละเอียดสิ่งของ</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <input
                                placeholder="ชื่อสิ่งของ"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                style={{ padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 16, outline: 'none' }}
                            />

                            <div style={{ display: 'flex', gap: 10 }}>
                                <input
                                    placeholder="URL รูปภาพ (optional)"
                                    value={form.img}
                                    onChange={e => setForm({ ...form, img: e.target.value })}
                                    style={{ flex: 1, padding: 16, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, fontSize: 16, outline: 'none' }}
                                />
                                <button onClick={handleAIExtract} style={{ background: theme.black, color: theme.white, padding: '0 20px', border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 600 }}>🤖 AI Tag</button>
                            </div>

                            {form.aiTags.length > 0 && (
                                <div style={{ padding: 15, background: theme.gray, borderRadius: theme.radius.md }}>
                                    🏷️ AI Tags: {form.aiTags.join(', ')}
                                </div>
                            )}

                            <button onClick={handleSubmit} style={{ padding: 16, background: theme.yellow, color: theme.black, border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 800, fontSize: 16, boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)' }}>
                                ✅ ยืนยันฝากของ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
