const express = require("express");
const cors = require("cors");

const chatRouter = require("./routers/chat")

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get("/", async (req, res) => {
    res.send({ status: "success" });
});

app.use(chatRouter);

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});