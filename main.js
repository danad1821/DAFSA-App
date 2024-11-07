let D = new DAFSA();
let M = new DAFSA();

let addBtn = document.getElementById("addBtn");
let acceptedString = document.getElementById("acceptedString");
let resetBtn = document.getElementById("resetBtn");
let emptyStringCheckBox = document.getElementById("emptyCheckbox");
let displayOptions = document.querySelectorAll(".toggle input[type=checkbox]");
let colorDiv = document.querySelector(".toggle-color");
let pos = 5;
let id = null;

displayOptions[0].checked = true;

function createMachine() {
  //function to create DAFSA machine
  D.add_accepted_string(acceptedString.value);
  acceptedString.value = "";
  M = D.minimize_dafsa();
  if (displayOptions[0].checked) {
    machine.appendChild(D.createDirectedGraph());
  } else {
    machine.appendChild(M.createDirectedGraph());
  }
}

addBtn.addEventListener("click", createMachine);

// Event listener for pressing "Enter"
acceptedString.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    createMachine();
  }
});

let searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener("click", function () {
  let searchText = document.getElementById("searchText");
  let found = false;
  if (displayOptions[0].checked) {
    found = D.search(searchText.value);
  } else {
    found = M.search(searchText.value);
  }
  let searchResult = document.getElementById("search-result");
  if (found == false) {
    searchResult.innerText = "String not found in Language";
    searchResult.style.color = "red";
    setTimeout(() => {
      searchResult.innerText = ""; // Clear the message after 10 seconds
    }, 10000);
  } else {
    searchResult.innerText = "String found in Language";
    searchResult.style.color = "green";
    setTimeout(() => {
      searchResult.innerText = ""; // Clear the message after 10 seconds
    }, 10000);
  }
  searchText.value = "";
});

function resetMachine() {
  D = new DAFSA();
  machine.innerHTML = ""; // Clear the displayed graph
}

resetBtn.addEventListener("click", resetMachine);

emptyStringCheckBox.addEventListener("change", () => {
  D.acceptance_of_empty_string(emptyStringCheckBox.checked);
  if (emptyStringCheckBox.checked == true || Object.keys(D.states).length > 1) {
    machine.appendChild(D.createDirectedGraph());
  } else {
    machine.innerHTML = "";
  }
});

function downloadGraphAsImage() {
  const svgElement = document.querySelector("#machine");
  const format = document.getElementById("format").value;

  html2canvas(svgElement, {
    useCORS: true, // Enables cross-origin images if any are used
    scale: 2, // Increases the resolution of the downloaded image
    backgroundColor: "#ffffff", // Sets a white background
  }).then((canvas) => {
    // Create a download link
    const link = document.createElement("a");
    link.download = `DAFSA-machine-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  });
}

function moveLeft() {
  if (pos == 110) {
    clearInterval(id);
  } else {
    pos++;
    colorDiv.style.left = pos + "px";
  }
}
function moveRight() {
  if (pos == 5) {
    clearInterval(id);
  } else {
    pos--;
    colorDiv.style.left = pos + "px";
  }
}

displayOptions[0].addEventListener("change", () => {
  if (displayOptions[0].checked) {
    displayOptions[1].checked = false;
    clearInterval(id);
    id = setInterval(moveRight, 0.5);
    machine.appendChild(D.createDirectedGraph());
  }
});
displayOptions[1].addEventListener("change", () => {
  if (displayOptions[1].checked) {
    displayOptions[0].checked = false;
    clearInterval(id);
    id = setInterval(moveLeft, 0.5);
    machine.appendChild(M.createDirectedGraph());
  }
});
