import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    studentId: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: false, default: "" },
    college: { type: String, required: false, default: "" },
    department: { type: String, required: false, default: "" },
    password: { type: String, required: true },
    profilePicture: { type: String, required: false, default: "" },
    googleId: { type: String, required: false, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin", "officer"], default: "user" },
    status: {
      type: String,
      enum: ["active", "offline", "inactive"],
      default: "active",
    },
    lastLoginAt: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

userSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
