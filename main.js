let D = new DAFSA();

let addBtn = document.getElementById('addBtn');
let acceptedString = document.getElementById('acceptedString');
let resetBtn = document.getElementById('resetBtn');
let emptyStringCheckBox=document.getElementById('emptyCheckbox')

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

emptyStringCheckBox.addEventListener('change', ()=>{
  D.acceptance_of_empty_string(emptyStringCheckBox.checked)
  if(emptyStringCheckBox.checked==true || Object.keys(D.states).length>1){
    machine.appendChild(D.createDirectedGraph());
  }
  else{
    machine.innerHTML="";
  }
})