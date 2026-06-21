import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency, courseId, courseTitle, studentId, studentName } = await request.json();

    // Validate required fields
    if (!amount || !courseId || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, courseId, studentId' },
        { status: 400 }
      );
    }

    // Parse amount - strip "Rs. " prefix and commas, convert to paise (smallest unit)
    let amountInPaise;
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[^0-9.]/g, '');
      amountInPaise = Math.round(parseFloat(cleaned) * 100);
    } else {
      amountInPaise = Math.round(amount * 100);
    }

    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount value' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: `atelier_${courseId}_${studentId}_${Date.now()}`,
      notes: {
        courseId: String(courseId),
        courseTitle: courseTitle || '',
        studentId: String(studentId),
        studentName: studentName || '',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order. Please check Razorpay credentials.' },
      { status: 500 }
    );
  }
}
