const database = require("./database");
const FoodRepository = require("./repository");

const repository = new FoodRepository(database);

async function getAllFood(request, reply){
    const responseDB = await repository.getAllFoods();

    if (responseDB.error) return reply.status(404).json(responseDB.error);

    reply.json(responseDB);
}

//Retorna uma comida pelo id como tambem o preço e seus recheios!
async function getFoodByID(request, reply) {
    const id = request.params.id; //Pegando o id passado na url

    const responseFood = await repository.getFoodByID(id);
    const responseFillings = await repository.getFillingsByID(id);

    if (responseFood.error) return reply.status(404).json(responseFood.error);

    const response = {
        food: responseFood,
        fillings: responseFillings
    }

    reply.json(response); 
}

async function setPayment(request, reply) {
    const payInfo = request.body;

    const responseDB = await repository.setPayment(payInfo);

    if (responseDB.error) return reply.status(404).json(responseDB.error);

    reply.json(responseDB);
}

async function getAllHistory(request, reply) {
    
    const responseDB = await repository.getAllHistory();

    if (responseDB.error) return reply.status(404).json(responseDB.error);

    reply.json(responseDB);
}

async function getHistoryByCpf(request, reply) {
   
     const cpf = request.params.cpf;

    let responseDB = await repository.getHistoryByCpf(cpf);
    
    if (responseDB.error) return reply.status(404).json(responseDB.error);

    reply.json({ history: responseDB });
}


module.exports = { getAllFood, getFoodByID, setPayment, getAllHistory, getHistoryByCpf };