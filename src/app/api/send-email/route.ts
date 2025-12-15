import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ============================================
// 📧 EMAIL API ROUTE
// ============================================
// วิธีใช้งาน:
// 1. สำหรับทดสอบ: ใช้ Ethereal (ค่า default) - ดู email ที่ ethereal.email
// 2. สำหรับ Production: ตั้งค่า Gmail ใน .env.local
// ============================================

// สร้าง Ethereal test account (ทำครั้งเดียวเมื่อ server start)
let testAccount: { user: string; pass: string } | null = null;

async function getTransporter() {
    // ถ้ามี Gmail config ใน env ให้ใช้ Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    // ถ้าไม่มี ให้ใช้ Ethereal (email ทดสอบ)
    if (!testAccount) {
        testAccount = await nodemailer.createTestAccount();
        console.log('📧 Ethereal Test Account Created:');
        console.log('   User:', testAccount.user);
        console.log('   Pass:', testAccount.pass);
        console.log('   View emails at: https://ethereal.email/login');
    }

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, text, html } = body;

        if (!to || !subject) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject' },
                { status: 400 }
            );
        }

        const transporter = await getTransporter();

        // ส่ง Email
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER || `"Smart Locker System" <${testAccount?.user || 'noreply@smartlocker.com'}>`,
            to,
            subject,
            text: text || '',
            html: html || `<pre style="font-family: sans-serif;">${text}</pre>`,
        });

        console.log('📧 Email sent:', info.messageId);

        // ถ้าเป็น Ethereal ให้แสดง preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('📧 Preview URL:', previewUrl);
        }

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl || null,
            provider: process.env.GMAIL_USER ? 'Gmail' : 'Ethereal (Test)',
        });

    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: String(error) },
            { status: 500 }
        );
    }
}
