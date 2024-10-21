let x = document.getElementById("btn");
// x.addEventListener("click", () => {
D = new DAFSA();
D.add_accepted_string("aa");
D.add_accepted_string("aab");
D.add_accepted_string("a");
D.add_accepted_string("b");
console.log("aa is " + D.isAccepted("aa"));
console.log("b is " + D.isAccepted("b"));
console.log("a is " + D.isAccepted("a"));
let states = D.states;
let finalStates = D.final_states;
let machine = document.getElementById("machine");
// machine.innerHTML="";
// for(let i=0; i<keys.length; i++){
//   let state=document.createElement('div');
//   state.className='state';
//   state.textContent=keys[i].toString();
//   machine.appendChild(state);
// }

// });
new LeaderLine(
  document.getElementById('machine'),
  document.getElementById('btn')
);