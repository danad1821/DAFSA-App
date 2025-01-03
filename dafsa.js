let machine = document.getElementById("machine");
let resetBtn = document.getElementById("resetBtn");

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
    this.heightMap = {};
    this.history = []; //to store added strings
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

  colorChange(color, curNodes) {
    Array.from(curNodes).forEach((node) => {
      node.style.fill = color;
    });
  }

  changeStateColor(state, curIndex) {
    let curNodes = document.getElementsByClassName(state.toString());
    if (curNodes.length > 0) {
      if (this.final_states.includes(state)) {
        setTimeout(() => {
          this.colorChange("green", curNodes);
        }, 500 * curIndex);
      } else {
        setTimeout(() => {
          this.colorChange("red", curNodes);
        }, 500 * curIndex);
      }
      if (this.final_states.includes(state)) {
      setTimeout(() => {
        this.colorChange(sessionStorage.getItem("finalColor"), curNodes);
      }, 10000);
    }
    else{
      setTimeout(() => {
        this.colorChange(sessionStorage.getItem("nonFinalColor"), curNodes);
      }, 10000);
    }
    }
  }

  search(s) {
    let curIndex = 0;
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
        if (v[1] === character || v[1].includes(character)) {
          this.changeStateColor(currentState, curIndex);
          curIndex += 1;
          // sees if there is a transition on the current character
          currentState = v[0]; // changes the current state to the state it reaches
          this.changeStateColor(currentState, curIndex);
          curIndex += 1;
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
    if (!s || s.trim() === "") {
      console.error("Cannot add an empty or invalid string.");
      return;
    }

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
      // the state already exists and might just need to be converted into a final state
      if (ind === slen) {
        this.non_final_to_final_conversion(currentState); // converts from non-final to final state

        // Ensure 's' is added to the history even if it's a substring of an existing string
        if (!this.history.includes(s)) {
          this.history.push(s);
        }
        this.updateHistoryDisplay(); // Update the history display
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

    // Add the string to the history and display it
    this.history.push(s);
    this.updateHistoryDisplay();
    if (this.history.includes(s)) {
      console.log(`String "${s}" is added to history.`);
    } else {
      console.log(`String "${s}" already exists in history. Re-adding.`);
      this.history.push(s); // Ensure the string is added to history
    }
  }

  updateHistoryDisplay() {
    const historyList = document.getElementById("history-list");
    const acceptedStringCountElement =
      document.getElementById("countOfStrings");

    if (!historyList || !acceptedStringCountElement) {
      console.error("DOM elements for history display are missing.");
      return;
    }

    historyList.innerHTML = ""; // Clear current history
    this.history.forEach((str) => {
      const listItem = document.createElement("li");
      listItem.textContent = str;
      listItem.className = "stringAdded";

      // Create Remove button
      const removeButton = document.createElement("button");
      removeButton.className = "removeBtn";

      // Font Awesome trash icon
      const trashIcon = document.createElement("i");
      trashIcon.className = "fas fa-trash";
      removeButton.appendChild(trashIcon);

      removeButton.onclick = () => {
        if (this.remove_accepted_string(str)) {
          this.updateHistoryDisplay(); // Refresh the display after removal
        } else {
          alert(`Could not remove the string "${str}" from the machine.`);
        }
      };
      // Add string and button to list item
      listItem.appendChild(removeButton);
      historyList.appendChild(listItem);

      // Update the count of accepted strings
      acceptedStringCountElement.textContent = this.history.length;
    });
  }

  // resetMachine() {
  //   const machine = document.getElementById("machine");
  //   machine.innerHTML = ""; // Clear the displayed graph

  //   const historyList = document.getElementById("history-list");
  //   historyList.innerHTML = ""; // Clear the history list

  //   // Optionally clear the count as well
  //   const acceptedStringCountElement =
  //     document.getElementById("countOfStrings");
  //   acceptedStringCountElement.textContent = "0"; // Reset the count of accepted strings

  //   updateHistoryDisplay(); // Call the function to update the history display

  //   // If you want to also clear the history array in your class, you can reset it as well
  //   this.history = []; // Clear the history array
  // }

  resetMachine() {
    const machine = document.getElementById("machine");
    machine.innerHTML = ""; // Clear the displayed graph

    const historyList = document.getElementById("history-list");
    historyList.innerHTML = ""; // Clear the history list

    // Optionally clear the count as well
    const acceptedStringCountElement =
      document.getElementById("countOfStrings");
    acceptedStringCountElement.textContent = "0"; // Reset the count of accepted strings

    updateHistoryDisplay(); // Call the function to update the history display

    // If you want to also clear the history array in your class, you can reset it as well
    this.history = []; // Clear the history array
  }

  remove_accepted_string(s) {
    // Ensure the string is in the machine and can be removed
    if (!this.history.includes(s)) {
      console.error(`String "${s}" does not exist in history.`); // String is not in history, cannot be removed
      return false;
    }
    // Reset the machine if history is empty
    if (this.history.length === 0) {
      this.resetMachine();
      return true;
    }

    let currentState = this.initial_state;
    let path = []; // Track the path of states and characters

    // Traverse and record each state and transition used by the string
    for (const character of s) {
      let foundTransition = false;
      for (const edge of this.states[currentState]) {
        if (edge[1] === character) {
          path.push({
            previousState: currentState,
            currentState: edge[0],
            character,
          });
          currentState = edge[0];
          foundTransition = true;
          break;
        }
      }
      if (!foundTransition) {
        console.error(`Transition for "${character}" not found.`);
        return false; // Transition for the character does not exist; cannot remove
      }
    }

    // Determine if this is Case 1, Case 2, or requires looping back
    if (this.states[currentState].length > 0) {
      // Case 1: The final state has outgoing transitions, so we should only convert it to a non-final state
      if (this.final_states.includes(currentState)) {
        this.final_to_non_final_conversion(currentState);
      }
    } else {
      // Case 2: The final state has no outgoing transitions, so we remove only this final state
      const { previousState } = path[path.length - 1];

      // Remove the transition from `previousState` to `currentState`
      this.states[previousState] = this.states[previousState].filter(
        (edge) => edge[0] !== currentState
      );

      // Delete the final state itself from the internal structure
      delete this.states[currentState];
      this.final_states = this.final_states.filter(
        (state) => state !== currentState
      );
      this.non_final_states = this.non_final_states.filter(
        (state) => state !== currentState
      );
      // Clean up dangling transitions for other states
      for (const state in this.states) {
        this.states[state] = this.states[state].filter(
          (edge) => edge[0] !== currentState
        );
      }
      // Check previous states and remove them if they are non-final and have no transitions
      let backIndex = path.length - 2; // Start from the state before the last one
      while (backIndex >= 0) {
        const {
          previousState: backPreviousState,
          currentState: backCurrentState,
        } = path[backIndex];

        // If the current state has outgoing transitions or is a final state, stop the loop
        if (
          this.states[backCurrentState].length > 0 ||
          this.final_states.includes(backCurrentState)
        ) {
          break;
        }

        // Otherwise, remove the transition from the previous state to the current state
        this.states[backPreviousState] = this.states[backPreviousState].filter(
          (edge) => edge[0] !== backCurrentState
        );

        // Delete the current state if it has no transitions and is non-final
        delete this.states[backCurrentState];
        this.non_final_states = this.non_final_states.filter(
          (state) => state !== backCurrentState
        );

        backIndex--; // Move to the next previous state
      }
    }

    // Remove the string from the history
    this.history = this.history.filter((str) => str !== s);

    // Redrawing the machine
    const machineDiv = document.getElementById("machine");
    const isExpanded = document.getElementById("expanded").checked;

    machineDiv.innerHTML = ""; // Clear the existing graph
    const minimizedMachine = this.minimize_dafsa();

    if (Object.keys(this.states).length > 0) {
      if (!isExpanded) {
        //If its the minimized DAFSA
        machineDiv.appendChild(minimizedMachine.createDirectedGraph());
      }
      if (isExpanded) {
        //If its the expanded DAFSA
        machineDiv.appendChild(this.createDirectedGraph()); // Redraw the expanded machine
      }
    }

    // Update history to remove the string and refresh the display
    this.updateHistoryDisplay();
    return true; // String successfully removed
  }

  createDirectedGraph() {
    let states = Object.keys(this.states);
    machine.innerHTML = ""; //clears the machine
    let nodeHierarchy = {
      start: [],
    }; // later used for structuring the graph
    let nodes = []; // all the nodes (states) of the graph
    let links = []; // the links (arrows) connecting the nodes
    let symbols = ["~"]; // symbols used for transitions
    let linkArc = (d) =>
      `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`; //function to create the arrow head shape
    for (const v of states) {
      //goes through the directed graph to collect all nodes, links and symbols
      //also used to create the hierarchy
      nodes.push({ id: v.toString() });
      if (links.length == 0) {
        nodes.push({ id: "start" });
        links.push({ source: "start", target: v.toString() });
        nodeHierarchy["start"].push(v.toString());
      }
      nodeHierarchy[v] = [];
      for (const edge of this.states[v]) {
        links.push({ source: v.toString(), target: edge[0].toString() });
        nodeHierarchy[v].push(edge[0]);
        symbols.push(edge[1]);
      }
    }
    const color = d3.scaleOrdinal(symbols, d3.schemeCategory10); //creates different colored arrows depending on symbol
    const width = machine.offsetWidth; //width of figure is equal to the machine div's width
    let height = machine.offsetHeight; //height of figure is equal to the machine div's height
    if (states.length > 4) {
      height = machine.offsetHeight + 80 * (states.length - 4);
    }

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
      .attr("refX", 30)
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
      .attr("stroke", (d) => {
        let sym = symbols[links.indexOf(d)];
        if (sym.length > 1) {
          return color("~");
        } else {
          return color(sym);
        }
      }) // determines the color of the arrow by the input symbol
      .attr(
        "marker-end",
        (d) => {
          let sym = symbols[links.indexOf(d)];
          if (sym.length > 1) {
            sym = symbols[0];
          }
          return `url(#arrow-${sym})`;
        }
        // Access symbol by index
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
      .attr("r", 20)
      .attr("fill", (d) => "#ADBADA")
      .attr("class", (d) =>
        d.id === "start"
          ? "start"
          : this.final_states.includes(d.id)
          ? "final "+d.id
          : "non-final "+d.id
      );
      // .attr("class", (d) => d.id);
    //if the state is a final state it adds another circle
    node
      .selectAll("circle.inner") // Select inner circles based on class
      .data((d) => (this.final_states.includes(d.id) ? [d] : [])) // Join data if the state is a final state
      .join("circle")
      .attr("class", "inner") // Adds class for conditional selection
      .attr("r", 15) // Inner circle radius
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("class", (d) => d.id)
      .attr("fill", (d) => "#8697C3"); // Fill inner circle

    node
      .append("text")
      .attr("x", -6) // Centering text horizontally
      .attr("y", 5) // Adjusting y-coordinate for vertical positioning
      .text((d) => d.id)
      .attr("class", "node-text")
      .clone(false)
      .lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    let spacing = 65; // Adjust spacing between nodes
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
      if (index > 0) {
        // if the parent has multiple children in the hierarchy than adjust spacing
        node.fx = node.fx - spacing * index;
        childX = node.fx;
      }
      if (fxyList.includes(childX + childY)) {
        // checks if there is already a node in thise postition
        childX += spacing / level;
        childY += spacing / level;
      }
      fxyList.push(childX + childY);
      //recursively calls to postition the children
      nodeHierarchy[node.id].forEach((child, index) => {
        positionNodes(findNode(child), childX, childY, level + 1, index);
      });
    }

    // Initial node positioning
    positionNodes(
      findNode("start"),
      -100,
      -height + (states.length / 2) * 150,
      0,
      0
    ); // Start with root node

    // Start the simulation
    simulation.alpha(1).restart();

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
      machine.style.cursor = "grabbing";
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
      machine.style.cursor = "grab";
    }
    //returns the svg
    return svg.node();
  }

  // Calculate heights of states
  calculateHeights(state) {
    if (this.heightMap[state] !== undefined) return this.heightMap[state];

    let maxHeight = 0;
    if (this.states[state]) {
      for (const [nextState] of this.states[state]) {
        maxHeight = Math.max(maxHeight, this.calculateHeights(nextState) + 1);
      }
    }
    this.heightMap[state] = maxHeight;
    return maxHeight;
  }

  // Group states by height
  groupByHeight() {
    const heightGroups = {};
    Object.entries(this.heightMap).forEach(([state, height]) => {
      if (!heightGroups[height]) heightGroups[height] = [];
      heightGroups[height].push(state);
    });
    return heightGroups;
  }

  minimize_dafsa() {
    let newDafsa = new DAFSA();

    // Deep copy the current DAFSA to newDafsa
    Object.assign(newDafsa, this);
    newDafsa.states = JSON.parse(JSON.stringify(this.states));
    newDafsa.final_states = [...this.final_states];

    Object.keys(newDafsa.states).forEach((state) =>
      newDafsa.calculateHeights(state)
    );
    const heightGroups = newDafsa.groupByHeight();

    // Minimize each height level from root to leaves
    Object.keys(heightGroups)
      .sort((a, b) => a - b) // Sort in ascending order
      .forEach((height) => {
        const statesAtHeight = heightGroups[height];

        // Separate final and non-final states at D height level
        const finalStateGroups = {};
        const nonFinalStateGroups = {};

        for (const state of statesAtHeight) {
          const isFinal = newDafsa.final_states.includes(state);

          const transitionKey = (newDafsa.states[state] || [])
            .map(([target]) => `${target}`)
            .sort()
            .join(", ");

          if (isFinal) {
            if (!finalStateGroups[transitionKey])
              finalStateGroups[transitionKey] = [];
            finalStateGroups[transitionKey].push(state);
          } else {
            if (!nonFinalStateGroups[transitionKey])
              nonFinalStateGroups[transitionKey] = [];
            nonFinalStateGroups[transitionKey].push(state);
          }
        }

        // Merge equivalent final states
        for (const states of Object.values(finalStateGroups)) {
          if (states.length > 1) {
            const representative = states[0];
            states
              .slice(1)
              .forEach((state) => newDafsa.mergeStates(representative, state));
          }
        }

        // Merge equivalent non-final states
        for (const states of Object.values(nonFinalStateGroups)) {
          if (states.length > 1) {
            const representative = states[0];
            states
              .slice(1)
              .forEach((state) => newDafsa.mergeStates(representative, state));
          }
        }
      });

    return newDafsa;
  }

  // Helper function to merge two states
  mergeStates(representative, stateToRemove) {
    // Ensure the stateToRemove exists before proceeding
    if (!this.states[stateToRemove]) {
      console.warn(`State "${stateToRemove}" does not exist. Skipping merge.`);
      return;
    }
    // Redirect all incoming transitions to `stateToRemove` to `representative`
    Object.keys(this.states).forEach((state) => {
      const updatedTransitions = {};

      this.states[state].forEach(([target, symbol]) => {
        if (target === stateToRemove) {
          target = representative; // Redirect transition to representative
        }

        // Combine symbols on the same transition
        if (!updatedTransitions[target]) {
          updatedTransitions[target] = new Set();
        }
        updatedTransitions[target].add(symbol); // Use a Set to avoid duplicates
      });

      // Convert each Set of symbols to a comma-separated string
      this.states[state] = Object.entries(updatedTransitions).map(
        ([target, symbolsSet]) => [target, Array.from(symbolsSet).join(", ")]
      );
    });

    // Merge transitions of `stateToRemove` into `representative`
    const combinedTransitions = this.states[representative] || [];
    this.states[stateToRemove].forEach(([target, symbol]) => {
      const existing = combinedTransitions.find(([t]) => t === target);

      if (existing) {
        // Add new symbol to existing transition
        const symbols = new Set(existing[1].split(", ").concat(symbol));
        existing[1] = Array.from(symbols).join(", ");
      } else {
        // Add new transition if it doesn't already exist
        combinedTransitions.push([target, symbol]);
      }
    });

    // Remove duplicate transitions and update states
    this.states[representative] = Array.from(
      new Set(combinedTransitions.map(JSON.stringify)),
      JSON.parse
    );

    delete this.states[stateToRemove];
    this.final_states = this.final_states.filter(
      (state) => state !== stateToRemove
    );
    this.non_final_states = this.non_final_states.filter(
      (state) => state !== stateToRemove
    );
  }
}
