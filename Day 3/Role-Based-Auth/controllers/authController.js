// `` Signup Controller ``
export const Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create new user
    const newUser = await UserModel.create({
      username,
      email,
      password,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
