import { connectDB } from "./db";
import {
  Category,
  Restaurant,
  MenuItem,
  User,
  Order,
  ISerializedCategory,
} from "./schema";
import { ICategory, IRestaurant, IMenuItem, IUser, IOrder } from "./schema";
import mongoose, { Double } from "mongoose";
import bcrypt from "bcryptjs";

export async function getCategories(): Promise<ISerializedCategory[]> {
  await connectDB();
  const categories = await Category.find().exec();
  return categories.map((category) => ({
    ...category.toObject(),
    _id: category._id.toString(),
  }));
}

export async function getFeaturedRestaurants(rating:Number): Promise<IRestaurant[]> {
  await connectDB();
  const restaurants = await Restaurant.find({ rating: { $gte: rating } })
    .sort({ rating: -1 })
    .exec();
  return restaurants.map((restaurant) => ({
    ...restaurant.toObject(),
    _id: restaurant._id.toString(),
  }));
}

export async function getRestaurantById(
  slugId: string
): Promise<IRestaurant | null> {
  await connectDB();

  // Prepare query to match either slugId or _id
  const query = {
    $or: [
      { slugId: slugId },
      {
        _id: mongoose.isValidObjectId(slugId)
          ? new mongoose.Types.ObjectId(slugId)
          : null,
      },
    ],
  };

  const restaurant = await Restaurant.findOne(query).exec();
  return restaurant
    ? { ...restaurant.toObject(), _id: restaurant._id.toString() }
    : null;
}

export async function getMenuItemsByRestaurant(
  slugId: string
): Promise<IMenuItem[]> {
  await connectDB();
  const restaurant = await Restaurant.findOne({ slugId }).select("_id").exec();
  if (!restaurant) return [];
  const menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
  }).exec();
  return menuItems.map((item) => item.toObject());
}

export async function searchRestaurants(
  query: string,
  category: string
): Promise<IRestaurant[]> {
  await connectDB();
  const searchRegex = new RegExp(query, "i");

  let restaurantsQuery = Restaurant.find({
    $or: [
      { name: searchRegex },
      { cuisine: searchRegex },
      { description: searchRegex },
    ],
  });

  if (category !== "all") {
    const menuItems = await MenuItem.find({ category })
      .select("restaurantId")
      .exec();
    const restaurantIds = [
      ...new Set(menuItems.map((item) => item.restaurantId.toString())),
    ];
    restaurantsQuery = restaurantsQuery
      .where("_id")
      .in(restaurantIds.map((id) => new mongoose.Types.ObjectId(id)));
  }

  const restaurants = await restaurantsQuery.exec();
  return restaurants.map((restaurant) => ({
    ...restaurant.toObject(),
    _id: restaurant._id.toString(), // Convert _id to string
  }));
}

export async function searchMenuItems(
  query: string,
  category: string
): Promise<IMenuItem[]> {
  await connectDB();
  const searchRegex = new RegExp(query, "i");

  let menuItemsQuery = MenuItem.find({
    $or: [{ name: searchRegex }, { description: searchRegex }],
  });

  if (category !== "all") {
    menuItemsQuery = menuItemsQuery.where("category").equals(category);
  }

  const menuItems = await menuItemsQuery.exec();
  return menuItems.map((item) => ({
    ...item.toObject(),
    _id: item._id.toString(), // Convert _id to string
    restaurantId: item.restaurantId.toString(), // Convert restaurantId to string
  }));
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  const user = await User.findOne({ email }).exec();
  return user ? user.toObject() : null;
}

export async function createUser({
  name,
  email,
  phone,
  password,
  address,
}: {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}): Promise<IUser> {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    phone,
    password: hashedPassword,
    address,
  });
  return user.save();
}

export async function updateUser(
  userId: string,
  userData: Partial<Pick<IUser, "name" | "phone" | "address">>
): Promise<IUser | null> {
  await connectDB();
  const user = await User.findById(userId).exec();
  if (!user) {
    return null;
  }

  if (userData.name) user.name = userData.name;
  if (userData.phone) user.phone = userData.phone;
  if (userData.address !== undefined)
    user.address = userData.address || undefined;

  await user.save();
  return user.toObject();
}

export async function createOrder(orderData: {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  deliveryAddress: string;
}): Promise<IOrder> {
  await connectDB();
  const order = new Order({
    id: Date.now().toString(),
    userId: new mongoose.Types.ObjectId(orderData.userId),
    restaurantId: new mongoose.Types.ObjectId(orderData.restaurantId),
    restaurantName: orderData.restaurantName,
    items: orderData.items,
    total: orderData.total,
    deliveryAddress: orderData.deliveryAddress,
    status: "pending",
    createdAt: new Date(),
    trackingSteps: [
      {
        step: "Order Placed",
        completed: true,
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      { step: "Restaurant Confirmed", completed: false },
      { step: "Food Being Prepared", completed: false },
      { step: "Out for Delivery", completed: false },
      { step: "Delivered", completed: false },
    ],
  });
  await order.save();
  return order.toObject();
}
