D = new DAFSA();

let addBtn = document.getElementById('addBtn');
let acceptedString = document.getElementById('acceptedString');
let resetBtn = document.getElementById('resetBtn');

function createMachine() { //function to create DAFSA machine
  D.add_accepted_string(acceptedString.value);
  acceptedString.value = "";
  machine.appendChild(D.createDirectedGraph());
}

addBtn.addEventListener("click", createMachine);

// Event listener for pressing "Enter"
acceptedString.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    createMachine();
  }
});


let searchBtn = document.getElementById('searchBtn');
searchBtn.addEventListener("click", function () {
  let searchText = document.getElementById('searchText');
  let inMachine = D.isAccepted(searchText.value);
  searchText.value = "";
})


function resetMachine() {
  D = new DAFSA();
  machine.innerHTML = ""; // Clear the displayed graph
}

resetBtn.addEventListener("click", resetMachine);