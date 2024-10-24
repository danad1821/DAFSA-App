let machine = document.getElementById("machine");
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
    // converts no final states into final states
    // this is needed if the user for example added the string 'aa' before string 'a' and they are both accepted
    this.non_final_states = this.non_final_states.filter((s) => s !== state); //removes the state from the non final states
    this.final_states.push(state); // adds it to the final
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

  isAccepted(s) {
    //checks if a string is accepted by the machine
    let currentState = this.initial_state;

    for (const character of s) {
      // goes the characters of the string being searched for
      if (this.states[currentState].length === 0) {
        //if there are more characters but the current state doesn't have any edges
        return false;
      }

      let changeOccurred = false;
      for (const v of this.states[currentState]) {
        if (v[1] === character) {
          // sees if there is a transition on the current character
          currentState = v[0]; // changes the current state to the state it reached
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

  createDirectedGraph() {
    machine.innerHTML = "";
    let nodes = [{id: 'start'}];
    let links = [{source: 'start', target:'q0'}];
    let symbols = ['~'];
    let linkArc = (d) =>
      `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`;
    for (const v of Object.keys(this.states)) {
      nodes.push({ id: v.toString() });
      for (const edge of this.states[v]) {
        links.push({ source: v.toString(), target: edge[0].toString() });
        symbols.push(edge[1]);
      }
    }

    const color = d3.scaleOrdinal(symbols, d3.schemeCategory10); //creates different colors depending on symbol
    const width = 900;
    const height = 600;
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force(
        "collide",
        d3.forceCollide((d) => 65)
      )
      .alpha(0);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // Per-type markers, as they don't inherit styles.
    svg
      .append("defs")
      .selectAll("marker")
      .data(symbols)
      .join("marker")
      .attr("id", (d) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");
    //create links
    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("class", "linkLabel")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => color(symbols[links.indexOf(d)])) // Use indexOf
      .attr(
        "marker-end",
        (d) => `url(#arrow-${symbols[links.indexOf(d)]})` // Access symbol by index
      );
    const linkLabelContainer = svg.selectAll(".linkLabel").data(links);
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
    // Add a drag behavior.
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
      .attr("fill", (d) => "#6baed6");
    //if the state is a final state it adds another circle
    node
      .selectAll("circle.inner") // Select inner circles based on class
      .data((d) => (this.final_states.includes(d.id) ? [d] : [])) // Join data based on condition
      .join("circle")
      .attr("class", "inner") // Add class for conditional selection
      .attr("r", 20) // Inner circle radius
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("fill", (d) => "#6baed6"); // Fill inner circle

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
    node.on("dblclick", (e, d) => console.log(nodes[d.index]));

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      linkLabel
      .attr("x", (d) => (d.source.x + d.target.x) / 2) // Center label between nodes
      .attr("y", (d) => (d.source.y + d.target.y) / 2); // Center label between nodes
    });
    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    let sv = document.createElement("svg");
    sv = svg.node();
    return svg.node();
  }

  minimize_dafsa(D) {
    console.log("minimized machine");
  }
}
