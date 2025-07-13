import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        enum: [
            "admin", "moderator", "user"
        ],
        default: "user"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🔒 Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) 
        return next();
    


    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔑 Add method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("Day3-User", userSchema);
export default UserModel;
