let D = new DAFSA();
let M = new DAFSA();

let addBtn = document.getElementById("addBtn");
let acceptedString = document.getElementById("acceptedString");
let reset = document.getElementById("resetBtn");
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


reset.addEventListener("click", function () {
  D.resetMachine(); // Call the resetMachine method on the D instance
});

emptyStringCheckBox.addEventListener("change", () => {
  D.acceptance_of_empty_string(emptyStringCheckBox.checked);
  if (emptyStringCheckBox.checked == true || Object.keys(D.states).length > 1) {
    machine.appendChild(D.createDirectedGraph());
  } else {
    machine.innerHTML = "";
  }
});


// function downloadGraphAsImage() {
//   const svgElement = document.querySelector("#machine");
//   const format = document.getElementById("format").value;

//   html2canvas(svgElement, {
//     useCORS: true, // Enables cross-origin images if any are used
//     scale: 2, // Increases the resolution of the downloaded image
//     backgroundColor: "#ffffff", // Sets a white background
//   }).then((canvas) => {
//     // Create a download link
//     const link = document.createElement("a");
//     link.download = `DAFSA - machine - image.${format}`;
//     link.href = canvas.toDataURL(`image / ${format}`);
//     link.click();
//   });
// }

function downloadGraphAsImage() {
  const element = document.querySelector("#machine"); // Your graph element
  const format = document.querySelector("#format").value; // Format selected by the user (PNG or JPEG)

  // Use html2canvas to capture the content of the element
  html2canvas(element, {
    useCORS: true, // Enable CORS to handle external resources
    scale: 2, // Set scale for higher resolution images
    backgroundColor: "#ffffff", // Background color if there's transparency
    x: 0,
    y: 0,
    width: element.scrollWidth, // Full width of the scrollable content
    height: element.scrollHeight, // Full height of the scrollable content
    scrollX: 0,
    scrollY: -window.scrollY, // Correct the scroll position
  }).then(function (canvas) {
    // Convert the canvas to image data in the selected format
    const imageData = canvas.toDataURL("image/" + format); // Based on selected format

    // Convert image data URL to an octet-stream for download
    const newData = imageData.replace(/^data:image\/(png|jpeg)/, "data:application/octet-stream");

    // Set up the download link and trigger the download
    const link = document.createElement("a");
    link.download = `DAFSA-graph-image.${format}`;
    link.href = newData;
    link.click(); // Trigger the download
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

// Change the color of non-final states
document.getElementById('nonFinalStateColorDrop').addEventListener('change', function () {
  const selectedColor = this.value;
  const nonFinalStates = document.querySelectorAll('.non-final');
  nonFinalStates.forEach(function (state) {
    state.style.fill = selectedColor;
  });
});

// // Change the color of final states
// document.getElementById('finalStateColorDrop').addEventListener('change', function () {
//   const selectedColor = this.value;
//   const finalStates = document.querySelectorAll('.final, .inner');
//   finalStates.forEach(function (state) {
//     state.style.fill = selectedColor;
//   });
// });


document.getElementById('finalStateColorDrop').addEventListener('change', function () {
  const selectedColor = this.value;
  const finalStates = document.querySelectorAll('.final');
  const innerStates = document.querySelectorAll('.inner');


  finalStates.forEach(function (state) {
    state.style.fill = selectedColor;
  });


  innerStates.forEach(function (state) {
    state.style.fill = selectedColor;
  });
});

