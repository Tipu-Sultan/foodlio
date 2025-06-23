import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import { IOrder, Order } from '@/lib/schema';
import mongoose from 'mongoose';

// Extend NextAuth session type to include user.id


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId, restaurantName, items, total, deliveryAddress } = await request.json();

    if (!restaurantId || !restaurantName || !items?.length || !total || !deliveryAddress) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const order = await createOrder({
      userId: session.user.id,
      restaurantId,
      restaurantName,
      items,
      total,
      deliveryAddress,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from session instead of query params
    const userId = session.user.id;

    await connectDB();
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ 
      success: true, 
      orders: orders.map((order) => ({
        ...order.toObject(),
        _id: order._id.toString(),
        userId: order.userId.toString(),
        restaurantId: order.restaurantId.toString(),
      })) 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { orderId, status } = await request.json();

  if (!orderId || !status) {
    return NextResponse.json(
      { success: false, message: 'orderId and status are required' },
      { status: 400 }
    );
  }

  // Validate status
  const validStatuses: IOrder['status'][] = [
    'pending',
    'confirmed',
    'preparing',
    'on-the-way',
    'delivered',
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { success: false, message: 'Invalid status' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Define tracking steps in order
    const statusFlow: IOrder['status'][] = [
      'pending',
      'confirmed',
      'preparing',
      'on-the-way',
      'delivered',
    ];
    const currentStatusIndex = statusFlow.indexOf(status);

    // Create or update trackingSteps
    const trackingSteps = statusFlow.map((step, index) => ({
      step: step.charAt(0).toUpperCase() + step.slice(1).replace('-', ' '), // Capitalize and format (e.g., "On-the-way" -> "On The Way")
      time: index <= currentStatusIndex ? new Date().toISOString() : undefined,
      completed: index <= currentStatusIndex,
    }));

    // Update order with new status and trackingSteps
    const order = await Order.findOneAndUpdate(
      { id: orderId },
      {
        $set: {
          status,
          trackingSteps,
        },
      },
      { new: true }
    ).exec();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: order.toObject() });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID required' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ 
      id: orderId, 
      userId: new mongoose.Types.ObjectId(session.user.id) 
    }).exec();

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found or not authorized' }, { status: 404 });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json({ 
        success: false, 
        message: 'Order cannot be canceled as it is already being prepared, out for delivery, or delivered' 
      }, { status: 400 });
    }

    await Order.deleteOne({ id: orderId });
    return NextResponse.json({ success: true, message: 'Order canceled successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error canceling order:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}