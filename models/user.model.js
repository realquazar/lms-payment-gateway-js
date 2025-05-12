import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { type } from "os";
import { validateHeaderName } from "http";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        maxLength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"],        
    },
    password: {
        type: String,
        required: [true, "password is required"],        
        minLength: [8, "password must be at least 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ["student", "instructor", "admin"],
            message: "please select a valid role"
        },
        default: "student",
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    bio: {
      type: String,
      maxLength: [200, "Bio cannot exceed 200 characters"],
    },
    enrolledCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        }
    }],
    createdCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: {
        type: Date,
        default: Date.now
    },        
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

// hashing password
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12)
    next();
})

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken= crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)
    return resetToken
}

userSchema.methods.updateLastActive = function() {
    this.lastActive = Date.now()
    return this.lastActive({validateBeforeSave: false})
}

// Virtual field for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function() {
    return this.enrolledCourses.length
})

export const User = mongoose.model("User", userScheme);