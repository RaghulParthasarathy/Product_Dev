import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token; // Access token from the cookie
  console.log("Token from cookie:", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    console.log("Decoded User:", decoded);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticateUser;
