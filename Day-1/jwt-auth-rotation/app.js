// Express starter template
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/user.routes.js";
import dbConnection from "./database/dbConnection.js";

const app = express();

// Database Connection
dbConnection();
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/", router);

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
