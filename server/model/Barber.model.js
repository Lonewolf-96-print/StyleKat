import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function arrayLimit(val) {
  return val.length <= 3;
}

const barberSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: [true, "Owner Name is required"],
      trim: true,
    },
    salonName: {
      type: String,
      required: [true, "Salon name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,

      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],

    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    barberCode: { String },
    address: {
      type: String,

      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    city: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    coordinates: {
      lat: {
        type: Number,
        default: 28.480808, // Default: Gurugram (example)
      },
      lng: {
        type: Number,
        default: 77.500617, // Default: Gurugram (example)
      }
    },
    images: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 3"],
    },

    role: {
      type: String,
      default: "barber",
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],

    // Notification Preferences
    notificationPreferences: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }, // Default off until configured
      sms: { type: Boolean, default: false },
    },

    // Push Subscriptions (Multiple devices)
    pushSubscriptions: [
      {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

barberSchema.pre("save", async function (next) {
  if (!this.password) return next(); // ✅ FIX Google Login null password
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


barberSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Barber = mongoose.model("Barber", barberSchema);
export default Barber;
