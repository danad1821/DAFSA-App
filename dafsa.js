class DAFSA {
  constructor() {
    this.states = {};
    this.initial_state = null;
    this.final_states = [];
    this.non_final_states = [];
    this.accepts_empty_string = false;
    this.heights = {};
  }

  add_initial_state(state) {
    if (this.initial_state === null) {
      this.initial_state = state;
      this.states[state] = [];

      if (this.accepts_empty_string) {
        this.add_non_final_state(this.initial_state);
      } else {
        this.add_final_state(this.initial_state);
      }

      return true;
    } else {
      return false; // state already exists
    }
  }

  add_final_state(state) {
    if (
      !this.states.hasOwnProperty(state) &&
      !this.final_states.includes(state)
    ) {
      this.final_states.push(state);
      this.states[state] = []; // Initialize empty list for adjacent states
      return true;
    } else {
      return false; // state already exists
    }
  }

  add_non_final_state(state) {
    if (
      !this.non_final_states.includes(state) &&
      !this.states.hasOwnProperty(state)
    ) {
      this.non_final_states.push(state);
      this.states[state] = []; // Initialize empty list for adjacent states
      return true;
    } else {
      return false; // state already exists
    }
  }

  non_final_to_final_conversion(state) {
    this.non_final_states = this.non_final_states.filter((s) => s !== state);
    this.final_states.push(state);
  }

  add_edge(v1, v2, sym) {
    if (!this.states.hasOwnProperty(v1) || !this.states.hasOwnProperty(v2)) {
      return false; // Either state doesn't exist
    }

    for (const v of this.states[v1]) {
      if (v[1] === sym) {
        return false; // Edge already exists
      }
    }

    const added_edge = [v2, sym];
    this.states[v1].push(added_edge);
    return true;
  }

  isAccepted(s) {
    let currentState = this.initial_state;

    for (const character of s) {
      if (this.states[currentState].length === 0) {
        return false;
      }

      let changeOccurred = false;
      for (const v of this.states[currentState]) {
        if (v[1] === character) {
          currentState = v[0];
          changeOccurred = true;
          break;
        }
      }

      if (!changeOccurred) {
        return false;
      }
    }

    return this.final_states.includes(currentState);
  }

  add_accepted_string(s) {
    const slen = s.length;

    if (this.initial_state === null) {
      this.add_initial_state("-1, 0");

      for (let i = 0; i < slen; i++) {
        if (i + 1 !== slen) {
          this.add_non_final_state("-1, " + (i + 1));
          this.add_edge("-1, " + i, "-1, " + (i + 1), s[i]);
        }
      }

      this.add_final_state("-1, " + slen);
      this.add_edge("-1, " + (slen - 1), "-1, " + slen, s[slen - 1]);
      this.last_added_state = slen;
    } else {
      let currentState = this.initial_state;
      const n = Object.keys(this.states).length;
      let ind = 0;

      for (let index = 0; index < s.length; index++) {
        let changeOccurred = false;

        for (const v of this.states[currentState]) {
          if (v[1] === s[index]) {
            currentState = v[0];
            ind = index + 1;
            changeOccurred = true;
            break;
          }
        }

        if (!changeOccurred) {
          break;
        }
      }

      if (ind === slen) {
        this.non_final_to_final_conversion(currentState);
        return;
      }

      for (let index = 0; index < s.length; index++) {
        this.heights[index] = [];

        if (index >= ind && index !== slen - 1) {
          this.add_non_final_state("-1, " + n);
          this.add_edge(currentState, "-1, " + n, s[index]);
          currentState = "-1, " + n;
          n++;
        }
      }

      this.add_final_state("-1, " + n);
      this.add_edge(currentState, "-1, " + n, s[slen - 1]);
      this.heights[slen] = [];
    }
  }

  get_states() {
    return this.states;
  }

  minimize_dafsa(D){
    console.log('minimized machine')
  }
}
