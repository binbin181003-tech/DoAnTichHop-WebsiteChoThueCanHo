import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your-super-secret-key"; // Bạn nên thay đổi chuỗi này

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Endpoint để đăng nhập
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // ---- Logic cho Admin ----
  if (username === "admin" && password === "admin123") {
    const adminToken = jwt.sign({ username: "admin", role: "admin" }, SECRET_KEY, {
      expiresIn: "1h", // Token hết hạn sau 1 giờ
    });
    return res.json({
      message: "Admin login successful",
      token: adminToken,
      user: { username: "admin", role: "admin" },
    });
  }

  // Trong tương lai, bạn có thể kết nối với database để kiểm tra user thường ở đây

  return res.status(401).json({ message: "Invalid credentials" });
});

app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});
