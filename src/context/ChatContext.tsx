'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, firestore, getDoc, doc } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { ref as dbRef, onValue as dbOnValue, push as dbPush, set as dbSet, update as dbUpdate } from 'firebase/database';

export interface ChatMessage {
    id: string;
    from: string;
    to: string;
    message: string;
    timestamp: number;
    type: 'chat' | 'request' | 'approve';
    read: boolean;
    lockerId?: number;
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    selectedConversation: string | null;
    setSelectedConversation: (id: string | null) => void;
    messages: ChatMessage[];
    unreadCount: number;
    userNames: { [key: string]: string };
    sendMessage: (to: string, msg: string, type?: ChatMessage['type'], lockerId?: number) => Promise<void>;
    markAsRead: (partnerId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

    const markAsRead = async (partnerId: string) => {
        if (!db || !user) return;
        const unread = messages.filter(m => m.from === partnerId && m.to === user.uid && !m.read);
        if (unread.length === 0) return;

        const updates: any = {};
        unread.forEach(m => {
            updates[`chats/${m.id}/read`] = true;
        });
        await dbUpdate(dbRef(db), updates);
    };

    // 1. Listen to Messages
    useEffect(() => {
        if (!db || !user) {
            setMessages([]);
            return;
        }
        const chatsRef = dbRef(db, 'chats');
        const unsubscribe = dbOnValue(chatsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const msgs: ChatMessage[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));

                // Filter logic (Strict Visibility)
                const filtered = msgs.filter(m => {
                    // Must involve me
                    if (m.from !== user.uid && m.to !== user.uid) return false;

                    // Request/Approve: Only recipient sees it
                    if (m.type === 'request' || m.type === 'approve') {
                        if (m.from === user.uid) return false; // Sender hides it
                    }
                    return true;
                });

                // Sort
                filtered.sort((a, b) => b.timestamp - a.timestamp);
                setMessages(filtered);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Fetch User Names
    useEffect(() => {
        const fetchNames = async () => {
            if (!firestore || !user) return;
            const ids = new Set<string>();
            messages.forEach(m => {
                if (m.from !== user.uid && !userNames[m.from]) ids.add(m.from);
                if (m.to !== user.uid && !userNames[m.to]) ids.add(m.to);
            });

            if (ids.size === 0) return;

            const newNames: any = {};
            for (const id of Array.from(ids)) {
                if (userNames[id]) continue;
                try {
                    const s = await getDoc(doc(firestore, 'users', id));
                    newNames[id] = s.exists() ? s.data().name : 'Unknown';
                } catch (e) { console.error(e); }
            }
            if (Object.keys(newNames).length > 0) {
                setUserNames(prev => ({ ...prev, ...newNames }));
            }
        };
        fetchNames();
    }, [messages, user, userNames]); // removed firestore dep

    // 3. Auto-read
    useEffect(() => {
        if (selectedConversation && user) {
            markAsRead(selectedConversation);
        }
    }, [selectedConversation, messages]);

    const sendMessage = async (to: string, msg: string, type: ChatMessage['type'] = 'chat', lockerId?: number) => {
        if (!db || !user) return;
        const r = dbRef(db, 'chats');
        const n = dbPush(r);
        const payload: any = {
            from: user.uid,
            to,
            message: msg,
            type,
            read: false,
            timestamp: Date.now()
        };
        if (lockerId) payload.lockerId = lockerId;
        await dbSet(n, payload);
    };

    const unreadCount = messages.filter(m => m.to === user?.uid && !m.read).length;

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, selectedConversation, setSelectedConversation, messages, unreadCount, userNames, sendMessage, markAsRead }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
