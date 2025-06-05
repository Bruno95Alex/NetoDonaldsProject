var infoFood = {};
var infoFillings = [];
var totalPrice = 0;
var cpfBuyer = null;

const openHistory = document.querySelector(".openHistory");
const closeModal = document.querySelector(".close-modal");
const modal = document.querySelector("#modal");
const fade = document.querySelector("#fade");

const toggleModal = () => {
    [modal, fade].forEach((el) => el.classList.toggle("hide"));
}

[openHistory, closeModal, fade].forEach((el) =>{
    el.addEventListener("click", () => toggleModal());  
});

async function getFood(idFood) {
    const response = await fetch("http://localhost:8080/food/" + idFood);
    const data = await response.json();

    console.log(data.fillings);
    infoFood = data.food[0]; //Pegando as comidas(nome, preço)
    infoFillings = data.fillings; //Pegando os recheios

    totalPrice = infoFood.price;
    
    document.querySelector("#price").innerHTML = infoFood.price.toFixed(2);
    renderFillings();
}

function renderFillings() {
    document.querySelector(".fillings").innerHTML = "";

    let id = 0; //atualizar preço
    for(let filling of infoFillings){
        let div = document.createElement("div");
        div.innerHTML = `<div> <input id=${id} type="checkbox"> ${filling.name} (R$ ${filling.price.toFixed(2)})</div>`;
        id++; //atualizar preço------   ^^^^
        div.addEventListener("change",setTotalPrice);//atualizar preço

        document.querySelector(".fillings").appendChild(div);
    }
}

function setTotalPrice(event) {  //atualizar preço
    let id = event.target.id;

    if(event.target.checked){
        totalPrice += infoFillings[id].price;
    }else {
        totalPrice -= infoFillings[id].price;
    }
    
    document.querySelector("#price").innerHTML = totalPrice.toFixed(2);
}

async function getAllHistory() {
    try {
        const response = await fetch("http://localhost:8080/historys");
        const data = await response.json();
        renderHistory(data);
    } catch (error) {
        console.error("Erro ao buscar todo o histórico:", error);
        renderHistory([]);
    }

}

async function getHistory(cpf){
const url = `http://localhost:8080/history/${cpf}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);

        if (data.history && data.history.length > 0) {
            renderHistory(data.history);
        } else {
            renderHistory([]);
        }

    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
    }
}

function filterHistoryByCpf() {
    const cpf = document.querySelector("#cpfFilter").value.trim();
    if (cpf) {
        getHistory(cpf);
    }else {
        getAllHistory();
    }
}

function renderHistory(historyData) {
    const container = document.querySelector(".history-list");
    container.innerHTML = "";

    if (!historyData || historyData.length === 0) {
        container.innerHTML = "Nenhuma compra encontrada!";
        return;
    }

    for (let item of historyData) {
        let div = document.createElement("div");
        div.innerHTML = `
            <div><strong>CPF:</strong> ${item.cpf}</div>
            <div><strong>Lanche ID:</strong> ${item.id_foods}</div>
            <div><strong>Descrição:</strong> ${item.description}</div>
            <div><strong>Preço:</strong> R$ ${item.price.toFixed(2)}</div>
            <div><strong>Data:</strong> ${new Date(item.pay_date).toLocaleDateString()}</div>
            <br>
        `;
        container.appendChild(div);
    }
}

async function sendDB() {
        const { value: formValues } = await Swal.fire({
        title: "Informe seu CPF",
        html: `
            <input type="number" id="swal-input1" class="swal2-input" placeholder="Apenas números">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return [
            document.getElementById("swal-input1").value
            ];
        }
        });
        if (!formValues[0].trim()){
            sendDB();
        }else {
            cpfBuyer = String(formValues);
            await postPayment();
            Swal.fire({
            title: "Agradecemos a prefêrencia! \n Volte sempre :)",
            text: `CPF: ${formValues}`,
            icon: "success"
            });
        }        
}

async function postPayment() {
    const selectedFillings = [];

    for (const checkbox of document.querySelectorAll(".fillings input[type='checkbox']:checked")){
        selectedFillings.push(infoFillings[checkbox.id].name);
    }

    let description = infoFood.name;
    if (selectedFillings.length > 0) {
        description += ` com ${selectedFillings.join(", ")}`;
    }

    const paymentDetails = {
        id_foods: infoFood.id,
        cpf: cpfBuyer,
        pay_date: new Date().toISOString(),
        description: description,
        price: parseFloat(totalPrice.toFixed(2)),
    };

        const response = await fetch("http://localhost:8080/payment", {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(paymentDetails),
        });

        const result = await response.json();  
}

function confirmPayment() { //MODAL
    Swal.fire({
        title: "Deseja finalizar o pagamento?",
        text:  `Preço total: R$ ${totalPrice.toFixed(2)}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não"
        }).then((result) => {
        if (result.isConfirmed) {
                // Swal.fire({
                // title: "Agradecemos a prefêrencia!",
                // text: "Volte sempre :)",
                // icon: "success"
                // });
             sendDB();
        }
    });
}

// pegando as informações da tapioca
getFood(1);