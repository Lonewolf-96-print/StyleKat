import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: false, select: false },


    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    // ✅ New bio field
    bio: {
      type: String,
      default: "",
      maxlength: 300, // keep it short like social profiles
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "barber", "admin", "customer"],
      default: "user",
    },
    userHiddenBookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: []
    }],

    // Notification Preferences
    notificationPreferences: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    // Push Subscriptions
    pushSubscriptions: [
      {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],
  },

  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.password) return next(); // ✅ FIX Google Login null password
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
