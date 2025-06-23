import mongoose, { Schema, model, Document } from 'mongoose';

// Interface for Category Document
interface ICategory extends Document {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Interface for Restaurant Document
interface IRestaurant extends Document {
  id: string;
  slugId: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  description: string;
  address: string;
  phone: string;
  isVeg?: boolean;
}

// Interface for MenuItem Document
interface IMenuItem extends Document {
  id: string;
  slugId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: Schema.Types.ObjectId;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
  popular?: boolean;
}

// Interface for Order Document
interface IOrder extends Document {
  id: string;
  userId: Schema.Types.ObjectId;
  restaurantId: Schema.Types.ObjectId;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered';
  createdAt: Date;
  trackingSteps?: {
    step: string;
    time?: string;
    completed: boolean;
  }[];
}

// Interface for User Document
interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  name: string;
  address?: string;
  phone?: string;
}

// Category Schema
const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Restaurant Schema
const RestaurantSchema = new Schema<IRestaurant>(
  {
    id: { type: String, required: true, unique: true },
    slugId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    image: { type: String, required: true },
    cuisine: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    deliveryTime: { type: String, required: true },
    deliveryFee: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, required: true, min: 0 },
    isOpen: { type: Boolean, required: true, default: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// MenuItem Schema
const MenuItemSchema = new Schema<IMenuItem>(
  {
    id: { type: String, required: true, unique: true },
    slugId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    isVegetarian: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    allergens: [{ type: String }],
    popular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    restaurantName: { type: String, required: true },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
    estimatedDelivery: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered'],
      default: 'pending',
      required: true,
    },
    createdAt: { type: Date, default: Date.now, required: true },
    trackingSteps: [
      {
        step: { type: String, required: true },
        time: { type: String },
        completed: { type: Boolean, required: true, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// User Schema
const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MenuItemSchema.index({ restaurantId: 1, category: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
UserSchema.index({ email: 1 }, { unique: true });

// Models
export const Category = mongoose.models.Category || model<ICategory>('Category', CategorySchema);
export const Restaurant = mongoose.models.Restaurant || model<IRestaurant>('Restaurant', RestaurantSchema);
export const MenuItem = mongoose.models.MenuItem || model<IMenuItem>('MenuItem', MenuItemSchema);
export const Order = mongoose.models.Order || model<IOrder>('Order', OrderSchema);
export const User = mongoose.models.User || model<IUser>('User', UserSchema);

// Export interfaces for TypeScript usage
export type { ICategory, IRestaurant, IMenuItem, IOrder, IUser };