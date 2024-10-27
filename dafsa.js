let machine = document.getElementById("machine");
function validate(x, a, b) {
  if (x < a) x = a;
  if (x > b) x = b;
  return x;
}

class DAFSA {
  constructor() {
    this.states = {};
    this.initial_state = null;
    this.final_states = [];
    this.non_final_states = [];
    this.accepts_empty_string = false;
    this.heights = {};
  }
  //adds an initial state
  add_initial_state(state) {
    if (this.initial_state === null) {
      this.initial_state = state;
      //if the machine doesn't accept empty strings it will add it to the non final states
      //otherwise it will add it to the final states array
      if (this.accepts_empty_string == false) {
        this.add_non_final_state(this.initial_state);
      } else {
        this.add_final_state(this.initial_state);
      }
      return true; //state is added
    } else {
      return false; // state already exists
    }
  }

  add_final_state(state) {
    if (
      !this.states.hasOwnProperty(state) &&
      !this.final_states.includes(state)
    ) {
      this.final_states.push(state); // adds the state to the final states
      this.states[state] = []; // Initialize empty list for the states it goes to
      return true; //state is added
    } else {
      return false; // state already exists
    }
  }

  add_non_final_state(state) {
    if (
      !this.non_final_states.includes(state) &&
      !this.states.hasOwnProperty(state)
    ) {
      this.non_final_states.push(state); //adds the state to the non final states
      this.states[state] = []; // Initialize empty list for the states it goes to
      return true; //state is added
    } else {
      return false; // state already exists
    }
  }

  non_final_to_final_conversion(state) {
    // converts non final states into final states
    // this is needed if the user for example added the string 'aa' before string 'a' and they are both accepted
    this.non_final_states = this.non_final_states.filter((s) => s !== state); //removes the state from the non final states
    this.final_states.push(state); // adds it to the final
  }

  final_to_non_final_conversion(state) {
    this.final_states = this.final_states.filter((s) => s !== state); //removes the state from the final states
    this.non_final_states.push(state); // adds it to the non final
  }

  add_edge(v1, v2, sym) {
    //adds a connects between 2 states by adding an array to the array for the state's key in the this.states object
    if (!this.states.hasOwnProperty(v1) || !this.states.hasOwnProperty(v2)) {
      return false; // Either state doesn't exist
    }

    for (const v of this.states[v1]) {
      if (v[1] === sym) {
        return false; // Edge already exists
      }
    }

    const added_edge = [v2, sym];
    this.states[v1].push(added_edge); // adds array of state and symbol seen to get to it
    return true; // edge has been added
  }

  acceptance_of_empty_string(value) {
    this.accepts_empty_string = value;
    if (value == true && this.initial_state != null) {
      this.non_final_to_final_conversion(this.initial_state);
    } else if (value == true && this.initial_state == null) {
      this.add_initial_state("q0");
    } else {
      this.final_to_non_final_conversion(this.initial_state);
    }
  }

  colorChange(color, curNodes){
    Array.from(curNodes).forEach((node) => {
      node.style.fill = color;
    });
  }

  changeStateColor(state) {
    let curIndex = 0;
    let curNodes = document.getElementsByClassName(state.toString());
    if (curNodes.length > 0) {
      if(this.final_states.includes(state)){
        setTimeout(() => {
          this.colorChange("green", curNodes)
          curIndex += 1;
        }, 5000 * curIndex);
      }else{
        setTimeout(() => {
          this.colorChange("red", curNodes)
          curIndex += 1;
        }, 5000 * curIndex);
      }
      setTimeout(() => {
        this.colorChange("white", curNodes)
      }, 20000);
    }
  }

  isAccepted(s) {
    //checks if a string is accepted by the machine
    let currentState = this.initial_state;
    for (const character of s) {
      // goes to the characters of the string being searched for
      if (this.states[currentState].length === 0) {
        //if there are more characters but the current state doesn't have any edges
        return false;
      }

      let changeOccurred = false;
      for (const v of this.states[currentState]) {
        if (v[1] === character) {
          this.changeStateColor(currentState);
          // sees if there is a transition on the current character
          currentState = v[0]; // changes the current state to the state it reaches
          this.changeStateColor(currentState);
          changeOccurred = true; // changes the value of changeOccured since a change occured
          break;
        }
      }
      //if no change occured that means the string is not in the list of accepted strings
      if (!changeOccurred) {
        return false;
      }
    }
    // if the state it is currently at is in the list of final states then the string is accepted
    return this.final_states.includes(currentState);
  }

  add_accepted_string(s) {
    const slen = s.length;
    if (this.initial_state === null) {
      // if it is the first string to be accepted by the machine
      // adds an initial state
      this.add_initial_state("q0");
      //adds states until before it the last character is reached
      for (let i = 0; i < slen; i++) {
        if (i + 1 !== slen) {
          // checks to make sure what is being added is not the final state
          this.add_non_final_state("q" + (i + 1));
          this.add_edge("q" + i, "q" + (i + 1), s[i]);
        }
      }
      //adds final state and the the edge to get to it
      this.add_final_state("q" + slen);
      this.add_edge("q" + (slen - 1), "q" + slen, s[slen - 1]);
    } else {
      // there already is one accepted string
      let currentState = this.initial_state;
      let ind = 0; // used to know where to start adding more states from

      for (let index = 0; index < s.length; index++) {
        let changeOccurred = false;

        for (const v of this.states[currentState]) {
          if (v[1] === s[index]) {
            currentState = v[0]; //changes the current state to the one reached by the machine
            ind = index + 1; // add 1 to ind to later determine where to start adding states
            changeOccurred = true; // changes the value of changeOccured since a change occured
            break;
          }
        }
        //if no change occured that means it should start adding states after this one
        if (!changeOccurred) {
          break;
        }
      }
      // the state already exists and might just need to be converted into a final state
      if (ind === slen) {
        this.non_final_to_final_conversion(currentState); // converts from non final to final state
        return;
      }
      let n = Object.keys(this.states).length; // get the number of states in the machine
      //
      for (let index = 0; index < slen; index++) {
        if (index >= ind && index !== slen - 1) {
          this.add_non_final_state("q" + n);
          this.add_edge(currentState, "q" + n, s[index]);
          currentState = "q" + n; //changes current state to the state just creates
          n++; // adds 1 to n
        }
      }
      // adds the final state used to accept this new string
      this.add_final_state("q" + n);
      this.add_edge(currentState, "q" + n, s[slen - 1]);
    }
  }

  get_states() {
    //returns the object containing all the information about all states
    return this.states;
  }

  remove_accepted_string(s) {
    if (this.isAccepted(s)) {
      let currentState = this.initial_state;
      for (let index = 0; index < s.length; index++) {
        for (const v of this.states[currentState]) {
          if (v[1] === s[index]) {
            currentState = v[0];
            break;
          }
        }
      }
    } else {
      return false;
    }
  }

  createDirectedGraph() {
    machine.innerHTML = ""; //clears the machine
    let nodeHierarchy = {
      start: ["q0"],
    }; // later used for structuring the graph
    let nodes = [{ id: "start" }]; // all the nodes (states) of the graph
    let links = [{ source: "start", target: "q0" }]; // the links (arrows) connecting the nodes
    let symbols = ["~"]; // symbols used for transitions
    let linkArc = (d) =>
      `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`; //function to create the arrow head shape
    for (const v of Object.keys(this.states)) { //goes through the directed graph to collect all nodes, links and symbols 
      //also used to create the hierarchy
      nodes.push({ id: v.toString() });
      nodeHierarchy[v] = [];
      for (const edge of this.states[v]) {
        links.push({ source: v.toString(), target: edge[0].toString() });
        nodeHierarchy[v].push(edge[0]);
        symbols.push(edge[1]);
      }
    }
    const color = d3.scaleOrdinal(symbols, d3.schemeCategory10); //creates different colored arrows depending on symbol
    const width = machine.offsetWidth; //width of figure is equal to the machine div's width
    const height = machine.offsetHeight; //height of figure is equal to the machine div's height

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-1000)) // preventing collision
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force(
        "collide",
        d3.forceCollide((d) => d.r + 5) // incase of collision
      )
      .alpha(0); //creates force simulation which will graph the nodes and links
    const svg = d3
      .create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height]); //create the svg that will contain the force simulayion

    // Per-type markers, as they don't inherit styles.
    svg
      .append("defs")
      .selectAll("marker")
      .data(symbols) // to add these on the arrows
      .join("marker")
      .attr("id", (d) => `arrow-${d}`) //to give it the arrow style and change the color depending on the symbol shown
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      //styling for the arrow
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");
    //create links and adds them to svg
    const link = svg
      .append("g") // g is a tag specific to the d3.js library
      .attr("fill", "none") 
      .attr("stroke-width", 1.5) //the width of the links 
      .attr("class", "linkLabel") //gives them a class 
      .selectAll("path")
      .data(links) 
      .join("path")
      .attr("stroke", (d) => color(symbols[links.indexOf(d)])) // determines the color of the arrow by the input symbol
      .attr(
        "marker-end",
        (d) => `url(#arrow-${symbols[links.indexOf(d)]})` // Access symbol by index
      ); // gets the tip of the arrow based off the input symbol
    const linkLabelContainer = svg.selectAll(".linkLabel").data(links); // a container of the labels of the links
    //creates the text that is placed on the link
    const linkLabel = linkLabelContainer
      .enter()
      .append("text")
      .attr("class", "linkLabel")
      .attr("dy", 5)
      .attr("filter", "url(#solid)")
      .text(function (d) {
        return symbols[links.indexOf(d)];
      });  
    linkLabelContainer.exit().remove();
    
    //create nodes
    const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g");
    // Add a drag behavior to node so the nodes can be moved around
    node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
    node
      .append("circle") //outter circle
      .attr("stroke", "black")
      .attr("opacity", (d) => (d.id === "start" ? 0 : 1))
      .attr("stroke-width", 1.5)
      .attr("r", 25)
      .attr("class", (d) => d.id)
      .attr("fill", (d) => "white");
    //if the state is a final state it adds another circle
    node
      .selectAll("circle.inner") // Select inner circles based on class
      .data((d) => (this.final_states.includes(d.id) ? [d] : [])) // Join data if the state is a final state
      .join("circle")
      .attr("class", "inner") // Add class for conditional selection
      .attr("r", 20) // Inner circle radius
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("class", (d) => d.id)
      .attr("fill", (d) => "white"); // Fill inner circle

    node
      .append("text")
      .attr("x", -6) // Center text horizontally
      .attr("y", 5) // Adjust y-coordinate for vertical positioning
      .text((d) => d.id)
      .clone(true)
      .lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    let spacing = 80; // Adjust spacing between nodes
    let fxyList = [];
    //finds node based off node name
    function findNode(name) {
      for (const node of nodes) {
        if (node.id === name) {
          return node;
        }
      }
      return undefined;
    }
    //positions nodes in places depending on the parent and hierarchy
    function positionNodes(node, x, y, level, index) {
      node.fx = x; //sets x position of the node
      node.fy = y; //sets y position of the node
      // changes the postion for the child
      let childX = x + spacing;
      let childY = y + spacing;
      if (index > 0) { // if the parent has multiple children in the hierarchy than adjust spacing
        node.fx = node.fx - spacing * index;
        childX = node.fx;
      }
      if (fxyList.includes([childX, childY])) { // checks if there is already a node in thise postition
        childX += spacing * 2;
        childY += spacing * 2;
      }
      fxyList.push([childX, childY]);
      //recursively calls to postition the children
      nodeHierarchy[node.id].forEach((child, index) => {
        positionNodes(findNode(child), childX, childY, level + 1, index);
      });
    }

    // Initial node positioning
    positionNodes(findNode("start"), -100, -200, 0, 0); // Start with root node

    // Start the simulation
    simulation.alpha(1).restart();

    node.on("click", (e, d) => console.log(nodes[d.index]));
    //for when the simulation starts to make sure the placement of the connections are correct
    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      linkLabel
        .attr("x", (d) => (d.source.x + d.target.x) / 2) // Center label between nodes
        .attr("y", (d) => (d.source.y + d.target.y) / 2); // Center label between nodes
    });
    // Reheat the simulation when drag starts, and fix the node position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.1).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      event.fixed = true;
    }

    // Update the dragged node position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      event.px = validate(event.px, 0, width);
      event.py = validate(event.py, 0, height);
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      if (event.x < 0 || event.x > width || event.y < 0 || event.y > height)
        event.fixed = false;
    }
    //returns the svg
    let sv = document.createElement("svg");
    sv = svg.node();
    return svg.node();
  }

  minimize_dafsa(D) {
    console.log("minimized machine");
  }
}
