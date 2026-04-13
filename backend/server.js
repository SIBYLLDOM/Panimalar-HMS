import app from "./app.js";
import "./config/db.js";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`deii punda Server running on port ${PORT}`);
});