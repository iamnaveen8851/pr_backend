require("dotenv").config();

const logout = async (req, res) => {
  try {
    res.clearCookie("jwtToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
    
      .status(200)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = logout;
