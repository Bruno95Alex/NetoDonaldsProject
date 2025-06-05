const express = require("express");
const Controller = require("./controller");
const cors = require("cors");

const server = express();
const PORT = 8080;

server.use(cors());
server.use(express.json());

//ROTAS:
server.get("/foods", Controller.getAllFood);
server.get("/food/:id", Controller.getFoodByID);
server.post("/payment", Controller.setPayment);

server.get("/historys", Controller.getAllHistory);
server.get("/history/:cpf", Controller.getHistoryByCpf);

server.listen(PORT, () => console.log("Server ON"));