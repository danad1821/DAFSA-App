let D = new DAFSA();

let addBtn = document.getElementById('addBtn');
let acceptedString = document.getElementById('acceptedString');
let resetBtn = document.getElementById('resetBtn');
let emptyStringCheckBox = document.getElementById('emptyCheckbox')

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

emptyStringCheckBox.addEventListener('change', () => {
  D.acceptance_of_empty_string(emptyStringCheckBox.checked)
  if (emptyStringCheckBox.checked == true || Object.keys(D.states).length > 1) {
    machine.appendChild(D.createDirectedGraph());
  }
  else {
    machine.innerHTML = "";
  }
})

let removeBtn = document.getElementById('removeBtn');
removeBtn.addEventListener('click', () => {
  let removeText = document.getElementById('removeText');
  console.log(D.remove_accepted_string(removeText.value));
  machine.appendChild(D.createDirectedGraph());
})

function downloadGraphAsImage() {
  const svgElement = document.querySelector("#machine");
  const format = document.getElementById("format").value;

  html2canvas(svgElement, {
    useCORS: true,    // Enables cross-origin images if any are used
    scale: 2,         // Increases the resolution of the downloaded image
    backgroundColor: "#ffffff" // Sets a white background
  }).then(canvas => {
    // Create a download link
    const link = document.createElement("a");
    link.download = `DAFSA-machine-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  });
}
