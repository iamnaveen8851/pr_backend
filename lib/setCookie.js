const setCookies = (token, res) => {
  res.cookie("jwtToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "Strict",
    maxAge: 2 * 60 * 60 * 1000,
  });

//   return cookiesSet;
};

module.exports = setCookies;
