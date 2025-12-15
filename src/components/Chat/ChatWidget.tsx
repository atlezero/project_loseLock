'use client';
import { useChat, ChatMessage } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../lib/theme';
import { useState, useMemo, useRef, useEffect } from 'react';

export default function ChatWidget() {
    const { isOpen, setIsOpen, selectedConversation, setSelectedConversation, messages, userNames, sendMessage } = useChat();
    const { user } = useAuth();
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConversation, isOpen]);

    const conversations = useMemo(() => {
        if (!user) return {};
        const group: { [key: string]: { lastMessage: ChatMessage; unread: number } } = {};
        messages.forEach(m => {
            const partner = m.from === user.uid ? m.to : m.from;
            if (!group[partner]) {
                group[partner] = { lastMessage: m, unread: 0 };
            }

            // Update last message
            if (m.timestamp > group[partner].lastMessage.timestamp) {
                group[partner].lastMessage = m;
            }
            // Count unread
            if (m.to === user.uid && !m.read) {
                group[partner].unread++;
            }
        });
        return group;
    }, [messages, user]);

    const handleSend = async () => {
        if (!selectedConversation || !chatInput.trim()) return;
        await sendMessage(selectedConversation, chatInput);
        setChatInput('');
    };

    if (!isOpen || !user) return null;

    return (
        <div style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 380,
            height: 500,
            background: theme.white,
            border: `1px solid ${theme.border}`,
            borderRadius: theme.radius.lg,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            fontFamily: 'sans-serif'
        }}>
            {/* Header */}
            <div style={{ background: theme.black, color: theme.white, padding: '16px 20px', borderRadius: '24px 24px 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedConversation ? (
                    <>
                        <button onClick={() => setSelectedConversation(null)} style={{ background: 'transparent', border: 'none', color: theme.white, cursor: 'pointer', fontSize: 16, marginRight: 10 }}>← กลับ</button>
                        <span>💬 {userNames[selectedConversation] || (selectedConversation.slice(0, 10) + '...')}</span>
                    </>
                ) : (
                    <span>📨 กล่องข้อความ</span>
                )}
                <button onClick={() => { setIsOpen(false); setSelectedConversation(null); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {!selectedConversation ? (
                    // LIST
                    Object.keys(conversations).length === 0 ? (
                        <p style={{ color: '#999', textAlign: 'center', marginTop: 50 }}>ยังไม่มีการสนทนา</p>
                    ) : (
                        Object.keys(conversations).map(partnerId => (
                            <div
                                key={partnerId}
                                onClick={() => setSelectedConversation(partnerId)}
                                style={{
                                    padding: 15,
                                    borderBottom: `1px solid ${theme.border}`,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    background: conversations[partnerId].unread > 0 ? theme.gray : 'white',
                                    transition: '0.2s'
                                }}
                            >
                                <div style={{ width: 45, height: 45, borderRadius: '50%', background: theme.yellow, color: theme.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18 }}>
                                    {(userNames[partnerId] || partnerId).charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 3, color: theme.text }}>{userNames[partnerId] || (partnerId.slice(0, 15) + '...')}</div>
                                    <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {conversations[partnerId].lastMessage.message.slice(0, 30)}...
                                    </div>
                                </div>
                                {conversations[partnerId].unread > 0 && (
                                    <div style={{ background: theme.error, color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                                        {conversations[partnerId].unread}
                                    </div>
                                )}
                            </div>
                        ))
                    )
                ) : (
                    // CHAT VIEW
                    <>
                        {messages
                            .filter(m => (m.from === user.uid && m.to === selectedConversation) || (m.from === selectedConversation && m.to === user.uid))
                            // Filters for visibility already done in Context? Yes.
                            // But verify strict visibility
                            .map(m => (
                                <div key={m.id} style={{ marginBottom: 10, textAlign: m.from === user.uid ? 'right' : 'left' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: m.from === user.uid ? theme.yellow : (m.type === 'approve' ? theme.black : theme.gray),
                                        color: m.from === user.uid ? theme.black : (m.type === 'approve' ? theme.white : theme.black),
                                        padding: '8px 12px',
                                        borderRadius: 16,
                                        maxWidth: '80%',
                                        textAlign: 'left',
                                        fontSize: 14
                                    }}>
                                        {m.type === 'request' && <span style={{ fontSize: 10, display: 'block', opacity: 0.8 }}>📨 คำขอรับของ</span>}
                                        {m.type === 'approve' && <span style={{ fontSize: 10, display: 'block', opacity: 0.8 }}>✅ อนุมัติแล้ว</span>}
                                        <span>{m.message}</span>
                                    </div>
                                </div>
                            ))
                        }
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            {selectedConversation && (
                <div style={{ padding: 15, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="พิมพ์ข้อความ..."
                        style={{ flex: 1, padding: 12, border: `1px solid ${theme.border}`, borderRadius: theme.radius.pill, outline: 'none' }}
                    />
                    <button onClick={handleSend} style={{ padding: '0 20px', background: theme.black, color: theme.white, border: 'none', borderRadius: theme.radius.pill, cursor: 'pointer', fontWeight: 600 }}>ส่ง</button>
                </div>
            )}
        </div>
    );
}
