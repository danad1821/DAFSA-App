D = new DAFSA();

let addBtn =document.getElementById('addBtn');
addBtn.addEventListener("click", function(){
  let acceptedString=document.getElementById('acceptedString');
  D.add_accepted_string(acceptedString.value);
  acceptedString.value="";
  machine.appendChild(D.createDirectedGraph());
})

let searchBtn=document.getElementById('searchBtn');
searchBtn.addEventListener("click", function(){
  let searchText=document.getElementById('searchText');
  let inMachine=D.isAccepted(searchText.value);
  searchText.value="";
})