import Victor from "https://cdn.skypack.dev/victor@1.1.0";

("use strict");

/**
 * @name Core
 *
 * @description
 * Core of the module for creating graphs
 *
 * {@link https://git.mirzaev.sexy/mirzaev/graph.mjs}
 *
 * @class
 * @public
 *
 * @license http://www.wtfpl.net/ Do What The Fuck You Want To Public License
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 *
 * @example <caption>Creating a simple graph</caption>
 * // Initializing the graph instance
 * сonst instance = new graph(document.getElementById('graph'));
 *
 * // Writing settings of the graph instance
 * instance.living = 3000;
 * instance.camera = true;
 * instance.operate = true;
 *
 * // Initializing nodes
 * const bebra = instance.node(new node(document.getElementById('bebra')));
 * const feet = instance.node(new node(document.getElementById('feet')));
 *
 * // Writing setting of every node
 * instance.nodes.forEach((node) => { node.variables.get("inputs").type = "deg" });
 *
 * // Initializing edges
 * instance.edge(new edge(feet, bebra));
 */
export default class core {
  /**
   * @name Shell
   *
   * @description
   * Shell of nodes
   *
   * @type {HTMLElement}
   *
   * @protected
   */
  #shell;

  /**
   * @name Shell (get)
   *
   * @description
   * Shell of nodes
   *
   * @type {HTMLElement}
   *
   * @public
   */
  get shell() {
    return this.#shell;
  }

  /**
   * @name Left (x-coordinate)
   *
   * @type {number} Value in pixels
   *
   * @protected
   */
  #left;

  /**
   * @name Left (x-coordinate) (get)
   *
   * @description
   * Getter for `this.#left`
   *
   * @type {number} Value in pixels
   *
   * @public
   */
  get left() {
    return this.#left;
  }

  /**
   * @name Top (y-coordinate)
   *
   * @type {number} Value in pixels
   *
   * @protected
   */
  #top;

  /**
   * @name Top (y-coordinate) (get)
   *
   * @description
   * Getter for `this.#top`
   *
   * @type {number} Value in pixels
   *
   * @public
   */
  get top() {
    return this.#top;
  }

  /**
   * @name Nodes
   *
   * @description
   * Registry of nodes
   *
   * @type {Set}
   *
   * @protected
   */
  #nodes = new Set();

  /**
   * @name Nodes (get)
   *
   * @description
   * Getter for `this.#nodes`
   *
   * @type {Set}
   *
   * @public
   */
  get nodes() {
    return this.#nodes;
  }

  /**
   * @name Edges
   *
   * @description
   * Registry of edges
   *
   * @type {Set}
   *
   * @protected
   */
  #edges = new Set();

  /**
   * @name Edges (get)
   *
   * @description
   * Getter for `this.#edges`
   *
   * @type {Set}
   *
   * @public
   */
  get edges() {
    return this.#edges;
  }

  /**
   * @name Interactions
   *
   * @description
   * Settings of interactions
   *
   * @type {object}
   *
   * @property {object} moving
   *
   * @property {object} moving.graph
   * @property {boolean} moving.graph.active
   * @property {object} moving.graph.inertion
   * @property {boolean} moving.graph.inertion.active
   *
   * @property {object} moving.nodes
   * @property {boolean} moving.nodes.active
   * @property {object} moving.nodes.inertion
   * @property {boolean} moving.nodes.inertion.active
   *
   * @property {object} pushing
   *
   * @property {boolean} pushing.active
   * @property {object} pushing.iterations
   * @property {number} pushing.iterations.from
   * @property {number} pushing.iterations.to
   *
   * @property {object} pulling
   *
   * @property {boolean} pulling.active
   * @property {object} pulling.iterations
   * @property {number} pulling.iterations.from
   * @property {number} pushing.iterations.to
   *
   * @protected
   */
  interactions = {
    moving: {
      graph: {
        active: true,
        inertion: {
          active: true
        }
      },
      nodes: {
        active: true,
        inertion: {
          active: true
        }
      }
    },
    pushing: {
      active: true,
      iterations: {
        from: 0,
        to: 100
      },
      cascade: {
        depth: 3
      }
    },
    pulling: {
      active: true,
      iterations: {
        from: 0,
        to: 100
      },
      cascade: {
        depth: 3
      }
    }
  };

  /**
   * @name Living
   *
   * @description
   * Interval to execute `this.move` to fix positioning errors
   *
   * @type {number} Value in milliseconds (`0` or `undefined` to disable)
   *
   * @protected
   */
  #living;

  /**
   * @name Living (set)
   *
   * @description
   * Setter for `this.#living`
   * Reinitializes the `this.#processes.get('living')` process
   *
   * @param {number} value Interval value in milliseconds (`0` or `undefined` to disable)
   *
   * @public
   */
  set living(value) {
    if (typeof value === "number" || typeof value === "undefined") {
      // Validated required argument

      // Writing value to the living property
      this.#living = value;

      // Deinitializing living process
      clearInterval(this.#processes.get("living"));

      // Initializing link to the instance
      const instance = this;

      // Initializing living process
      if (typeof this.#living === "number" && this.#living !== 0)
        this.#processes.set(
          "living",
          setInterval(() => {
            for (const node of this.#nodes) {
              // Iterating over nodes

              // Processing pushings between nodes
              node.push(
                instance.interactions.pushing.cascade.depth,
                instance.nodes
              );

              // Processing pullings between nodes
              node.pull(instance.interactions.pulling.cascade.depth);
            }
          }, this.#living)
        );
    }
  }

  /**
   * @name Living (get)
   *
   * @description
   * Getter for `this.#living`
   *
   * @type {number}
   *
   * @public
   */
  get living() {
    return this.#living;
  }

  /**
   * @name Camera
   *
   * @description
   * Allowed to moving the shell (like an abstract camera)?
   *
   * @type {boolean}
   *
   * @protected
   */
  #camera = false;

  /**
   * @name Camera (set)
   *
   * @description
   * Setter for `this.#camera`
   * Reinitializes camera moving processes
   *
   * @param {boolean} value Activate moving the shell (like an abstract camera)?
   *
   * @public
   */
  set camera(value) {
    if (typeof value === "boolean") {
      // Validated required argument

      // Writing value to the camera property
      this.#camera = value;

      if (this.#camera) {
        // Activated moving the shell (like an abstract camera)

        // Deinitializing the "dragstart" and the "selectstart" event listeners
        this.#shell.ondragstart = this.#shell.onselectstart = null;

        // Initializing link to the instance
        const instance = this;

        // Disconnecting deprecated event listener for starting moving the shell element
        document.removeEventListener(
          "mousedown",
          this.#listeners.get("camera.start")
        );

        // Initializing event listener for starting moving the shell
        this.#listeners.set("camera.start", (start) => {
          // Started moving the shell

          if (
            start.target === instance.#shell ||
            !instance.#shell.contains(event.target)
          ) {
            // The mouse cursor is down over the shell element or its ascendant element

            // Initializing coordinates of the shell element
            const left = start.pageX - instance.#shell.offsetLeft + pageXOffset;
            const top = start.pageY - instance.#shell.offsetTop + pageYOffset;

            // Disconnecting deprecated event listener for moving the shell element
            document.removeEventListener(
              "mousemove",
              instance.#listeners.get("camera.moving")
            );

            // Initializing event listener for moving the shell element
            this.#listeners.set("camera.moving", (moving) => {
              // Moving the shell

              // Writing x-coordinate into the property
              instance.#left = moving.pageX - left;

              // Writing y-coordinate into the property
              instance.#top = moving.pageY - top;

              // Writing x-coordinate into the HTML-element attribute
              if (instance.variables.get("left").active)
                instance.#shell.style.setProperty(
                  "--graph-shell-left",
                  instance.#left + instance.variables.get("left").type
                );

              // Writing y-coordinate into the HTML-element attribute
              if (instance.variables.get("top").active)
                instance.#shell.style.setProperty(
                  "--graph-shell-top",
                  instance.#top + instance.variables.get("top").type
                );
            });

            // Connecting event listener for moving the shell element
            document.addEventListener(
              "mousemove",
              instance.#listeners.get("camera.moving")
            );
          }
        });

        // Connecting event listener for starting moving the shell element
        document.addEventListener(
          "mousedown",
          this.#listeners.get("camera.start")
        );

        // Disconnecting deprecated event listener for ending moving the shell element
        document.removeEventListener(
          "mouseup",
          this.#listeners.get("camera.end")
        );

        // Initializing event listener for ending moving the shell
        this.#listeners.set("camera.end", (end) => {
          // Ended moving the shell

          // Disconnecting event listener for moving the shell element
          document.removeEventListener(
            "mousemove",
            instance.#listeners.get("camera.moving")
          );
        });

        // Connecting event listener for ending moving the shell element
        document.addEventListener("mouseup", this.#listeners.get("camera.end"));
      } else {
        // Deactivated moving the shell (like an abstract camera)

        // Disconnecting event listener for starting moving the shell element
        document.removeEventListener(
          "mousedown",
          this.#listeners.get("camera.start")
        );

        // Disconnecting event listener for ending moving the shell element
        document.removeEventListener(
          "mouseup",
          this.#listeners.get("camera.end")
        );

        // Disconnecting event listener for moving the shell element
        document.removeEventListener(
          "mousemove",
          this.#listeners.get("camera.moving")
        );
      }
    }
  }

  /**
   * @name Camera (get)
   *
   * @description
   * Getter for `this.#camera`
   *
   * @type {boolean}
   *
   * @public
   */
  get camera() {
    return this.#camera;
  }

  /**
   * @name Operate
   *
   * @description
   * Allowed to operate with nodes?
   *
   * @type {boolean}
   *
   * @protected
   */
  #operate = false;

  /**
   * @name Operate (set)
   *
   * @description
   * Setter for `this.#operate`
   * Reinitializes operating with nodes processes
   *
   * @param {boolean} value Allowed to operate with nodes?
   *
   * @public
   */
  set operate(value) {
    if (typeof value === "boolean") {
      // Validated required argument

      // Writing value to the operate property
      this.#operate = value;

      if (this.#operate) {
        // Allowed to operate with nodes

        for (const node of this.#nodes) {
          // Iterating over nodes

          // Activating the node
          node.activate(this);
        }
      } else {
        // Not allowed to operate with nodes

        for (const node of this.#nodes) {
          // Iterating over nodes

          // Deactivating the node
          node.deactivate();
        }
      }
    }
  }

  /**
   * @name Operate (get)
   *
   * @description
   * Getter for `this.#operate`
   *
   * @type {boolean}
   *
   * @public
   */
  get operate() {
    return this.#operate;
  }

  /**
   * @name Variables
   *
   * @description
   * The registry of variables that will be added to the `style` attribute of the HTML-elements
   *
   * Editing DOM, including changing argument values,
   * has a significant impact on performance - try to use as few variables as possible
   *
   * @example Write in format without "--graph-shell-"
   * `["left", true]` will be `style="--graph-shell-left: 180px;"`
   *
   * These variables are also stored in the object to avoid reading DOM: "left", "top"
   *
   * @type {Map}
   *
   * @public
   */
  variables = new Map([
    ["left", { active: true, type: "px" }],
    ["top", { active: true, type: "px" }]
  ]);

  /**
   * @name Listeners
   *
   * @description
   * Registry of event listeners
   *
   * @type {Map}
   *
   * @protected
   */
  #listeners = new Map();

  /**
   * @name Processes
   *
   * @description
   * Registry of running processes
   *
   * @type {Map}
   *
   * @protected
   */
  #processes = new Map();

  /**
   * @name Constructor
   *
   * @description
   * Initialize a graph instance
   *
   * @param {HTMLElement} shell The shell element
   **/
  constructor(shell) {
    if (shell instanceof HTMLElement) {
      // Initialized the shell

      // Writing the shell
      this.#shell = shell;

      // Deinitializing the "dragstart" and the "selectstart" event listeners
      this.#shell.ondragstart = this.#shell.onselectstart = null;
    }
  }

  /**
   * @name Node
   *
   * @description
   * Registrate the node in the system
   *
   * @param {node} target The node instance
   *
   * @return {(node|false)} The node, if initialized
   **/
  node(target) {
    if (target instanceof node) {
      // Validated required arguments

      // Moving the node element
      target.move(
        this.#shell.offsetWidth / 2 -
          target.augmented / 2 +
          (0.5 - Math.random()) * 500,
        this.#shell.offsetHeight / 2 -
          target.augmented / 2 +
          (0.5 - Math.random()) * 500
      );

      // Writing into the nodes registry
      this.#nodes.add(target);

      // Activating the node
      if (this.#operate) target.activate(this);

      // Exit (success)
      return target;
    }

    // Exit (fail)
    return false;
  }

  /**
   * @name Edge
   *
   * @description
   * Registrate the edge in the system
   *
   * @param {edge} target The edge instance
   *
   * @return {(edge|false)} The edge, if initialized
   **/
  edge(target) {
    if (target instanceof edge) {
      // Validated required attributes

      if (
        this.#shell instanceof HTMLElement &&
        target.shell instanceof SVGElement
      ) {
        // Initialized shell elements

        // Writing the edge into the shell element
        this.#shell.appendChild(target.shell);

        // Writing into the edges registry
        this.#edges.add(target);

        // Exit (success)
        return target;
      }
    }

    // Exit (fail)
    return false;
  }
}

/**
 * @name Node
 *
 * @description
 * Node of the module for creating graphs
 *
 * {@link https://git.mirzaev.sexy/mirzaev/graph.mjs}
 *
 * @class
 * @public
 *
 * @license http://www.wtfpl.net/ Do What The Fuck You Want To Public License
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 *
 * @example <caption>Creating a node</caption>
 * const node = new node(document.getElementById('my_node'));
 */
export class node {
  /**
   * @name Shell
   *
   * @description
   * Shell of the node
   *
   * @type {HTMLElement}
   *
   * @protected
   */
  #shell;

  /**
   * @name Shell (get)
   *
   * @description
   * Getter for shell of the node
   *
   * @type {HTMLElement}
   *
   * @public
   */
  get shell() {
    return this.#shell;
  }

  /**
   * @name Left (x-coordinate)
   *
   * @type {number} Value in pixels
   *
   * @protected
   */
  #left;

  /**
   * @name Left (x-coordinate) (get)
   *
   * @description
   * Getter for `this.#left`
   *
   * @type {number} Value in pixels
   *
   * @public
   */
  get left() {
    return this.#left || 0;
  }

  /**
   * @name Top (y-coordinate)
   *
   * @type {number} Value in pixels
   *
   * @protected
   */
  #top;

  /**
   * @name Top (y-coordinate) (get)
   *
   * @description
   * Getter for `this.#top`
   *
   * @type {number} Value in pixels
   *
   * @public
   */
  get top() {
    return this.#top || 0;
  }

  /**
   * @name Movement
   *
   * @type {object}
   *
   * @property {string} status Status of the movement ("moving", "completed")
   *
   * @property {object} from
   * @property {number} from.left Left-coordinate of the start of the movement
   * @property {number} from.top Top-coordinate of the start of the movement
   *
   * @property {object} to
   * @property {number} to.left Left-coordinate of the end of the movement
   * @property {number} to.top Top-coordinate of the end of the movement
   *
   * @protected
   */
  #movement = {
    status,
    from: { left: 0, top: 0 },
    to: { left: 0, top: 0 }
  };

  /**
   * @name Inputs
   *
   * @description
   * The regitry of input edges
   *
   * @type {Set}
   *
   * @protected
   */
  #inputs = new Set();

  /**
   * @name Inputs (get)
   *
   * @description
   * Getter for the regitry of input edges
   *
   * @type {Set}
   *
   * @public
   */
  get inputs() {
    return this.#inputs;
  }

  /**
   * @name Outputs
   *
   * @description
   * The regitry of output edges
   *
   * @type {Set}
   *
   * @protected
   */
  #outputs = new Set();

  /**
   * @name Outputs (get)
   *
   * @description
   * Getter for the regitry of output edges
   *
   * @type {Set}
   *
   * @public
   */
  get outputs() {
    return this.#outputs;
  }

  /**
   * @name Button
   *
   * @description
   * Identifier of the mouse button that will perform the movement.
   *
   * 0: Main button pressed, usually the left button or the un-initialized state
   * 1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
   * 2: Secondary button pressed, usually the right button
   * 3: Fourth button, typically the Browser Back button
   * 4: Fifth button, typically the Browser Forward button
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}
   *
   * @type {number}
   *
   * @public
   */
  button = 0;

  /**
   * @name Size
   *
   * @description
   * The HTML-element initial size in pixels
   *
   * @type {number}
   *
   * @public
   */
  size = 100;

  /**
   * @name Augmented size
   *
   * @description
   * The HTML-element augmented size in pixels
   *
   * Will be generated at runtime by formula:
   * `this.size + (this.addition * this.#inputs.size - this.subtraction * this.#outputs.size)`
   *
   * @type {number}
   *
   * @protected
   */
  #augmented;

  /**
   * @name Augmented size (get)
   *
   * @description
   * Getter for the augmented size
   *
   * The HTML-element augmented size in pixels
   *
   * Will be generated at runtime by formula:
   * `this.size + (this.addition * this.#inputs.size - this.subtraction * this.#outputs.size)`
   *
   * @type {number}
   *
   * @public
   */
  get augmented() {
    return this.#augmented || this.size || 0;
  }

  /**
   * @name Radius (get)
   *
   * @description
   * Getter for the augmented radius
   *
   * @type {number}
   *
   * @public
   */
  get radius() {
    return this.augmented / 2 || 0;
  }

  /**
   * @name Center (get)
   *
   * @description
   * Getter for the node shell HTML-element center coordinates values
   *
   * @type {object}
   *
   * @property {number} left Left-coordinate from center of the shell HTML-element
   * @property {number} top Top-coordinate from center of the shell HTML-element
   *
   * @public
   */
  get center() {
    return {
      left: this.radius + this.left,
      top: this.radius + this.top
    };
  }

  /**
   * @name Addition
   *
   * @description
   * The value of diameter addition
   *
   * @type {number}
   *
   * @public
   */
  addition = 20;

  /**
   * @name Subtraction
   *
   * @description
   * The value of diameter subtraction
   *
   * @type {number}
   *
   * @public
   */
  subtraction = 5;

  /**
   * @name Interactions
   *
   * @description
   * Types of the node interactions
   *
   * @type {object}
   *
   * @property {object} movement Movement of the node
   * @property {boolean} movement.active Is movement enabled?
   * @property {object} movement.synchronization
   * @property {number} movement.synchronization.interval
   *
   * @property {object} pushing Pushing with nodes
   * @property {boolean} pushing.active Is pushing with nodes enabled?
   * @property {number} pushing.distance
   *
   * @property {object} pulling Pulling with nodes
   * @property {boolean} pulling.active Is pulling with nodes enabled?
   * @property {number} pulling.distance
   *
   * @public
   */
  interactions = {
    movement: {
      active: true,
      synchronization: {
        interval: 20
      }
    },
    pushing: {
      active: true,
      distance: 100
    },
    pulling: {
      active: true,
      distance: 130
    }
  };

  /**
   * @name Variables
   *
   * @description
   * The registry of variables that will be added to the `style` attribute of the HTML-elements
   *
   * Editing DOM, including changing argument values,
   * has a significant impact on performance - try to use as few variables as possible
   *
   * @example Write in format without "--graph-node-"
   * `["left", true]` will be `style="--graph-node-left: 180px;"`
   *
   * These variables are also stored in the object to avoid reading DOM: "left", "top"
   *
   * @type {Map}
   *
   * @public
   */
  variables = new Map([
    ["left", { active: false, type: "px" }],
    ["top", { active: false, type: "px" }],
    ["from-left", { active: true, type: "px" }],
    ["from-top", { active: true, type: "px" }],
    ["to-left", { active: true, type: "px" }],
    ["to-top", { active: true, type: "px" }],
    ["layer", { active: true, type: "" }],
    ["size", { active: false, type: "px" }],
    ["augmented", { active: true, type: "px" }],
    // ["addition", false],
    // ["subtraction", false],
    ["inputs", { active: true, type: "" }],
    ["outputs", { active: false, type: "" }]
  ]);

  /**
   * @name Listeners
   *
   * @description
   * Registry of event listeners
   *
   * @type {Map}
   *
   * @protected
   */
  #listeners = new Map();

  /**
   * @name Processes
   *
   * @description
   * Registry of running processes
   *
   * @type {Map}
   *
   * @protected
   */
  #processes = new Map();

  /**
   * @name Constructor
   *
   * @description
   * Initialize a node instance
   *
   * @param {HTMLElement} shell The node element
   **/
  constructor(shell) {
    if (shell instanceof HTMLElement) {
      // Validated required arguments

      // Writing the HTML-element
      this.#shell = shell;

      // Deinitializing the "dragstart" and the "selectstart" event listeners
      this.#shell.ondragstart = this.#shell.onselectstart = null;

      // Initializing augmented size variable
      this.augment();

      // Initializing edges variables
      this.edges();
    }
  }

  /**
   * @name Augment
   *
   * @description
   * Calculate and write augmented size into the node property and argument of the HTML-element
   **/
  augment() {
    // Calculating and writing augmented size into the node property
    this.#augmented =
      this.size +
      (this.addition * this.#inputs.size -
        this.subtraction * this.#outputs.size);

    // Writing augmented size into the `style` argument of the HTML-element
    if (this.variables.get("augmented").active)
      this.#shell?.style.setProperty(
        "--graph-node-augmented",
        this.#augmented + this.variables.get("augmented").type
      );
  }

  /**
   * @name Edges
   *
   * @description
   * Write inputs and outputs edges into the `style` argument of the HTML-element
   **/
  edges() {
    // Writing inputs edges into the `style` argument of the HTML-element
    if (this.variables.get("inputs").active)
      this.#shell?.style.setProperty(
        "--graph-node-inputs",
        this.#inputs.size + this.variables.get("inputs").type
      );

    // Writing outputs edges into the `style` argument of the HTML-element
    if (this.variables.get("outputs").active)
      this.#shell?.style.setProperty(
        "--graph-node-outputs",
        this.#outputs.size + this.variables.get("outputs").type
      );
  }

  /**
   * @name Activate
   *
   * @description
   * Activate the node for operating relative to `shell`
   *
   * @param {core} graph The graph instance
   **/
  activate(graph) {
    if (graph instanceof core) {
      // Validated required arguments

      if (this.#shell instanceof HTMLElement) {
        // Initialized the shell element

        // Initializing link to the instance
        const instance = this;

        // Disconnecting deprecated event listener for starting moving the node
        this.#shell.removeEventListener(
          "mousedown",
          this.#listeners.get("movement.start")
        );

        // Initializing event listener for starting moving the node
        this.#listeners.set("movement.start", (start) => {
          // Started moving

          if (start.type === "touchstart" || start.button === instance.button) {
            // Pressing with a finger or a mouse button specified in `instance.button` by the user (mouse, touch)

            // Deinitializing process for checking that the movement was completed
            if (this.#processes.has("movement"))
              clearInterval(this.#processes.get("movement"));

            // Writing "left" coordinate into the property
            this.#left = Math.round(this.#shell.offsetLeft);

            // Writing "top" coordinate into the property
            this.#top = Math.round(this.#shell.offsetTop);

            // Writing "left" coordinate into the HTML-element attribute
            if (this.variables.get("left").active)
              this.#shell.style.setProperty(
                "--graph-node-left",
                this.#left + this.variables.get("left").type
              );

            // Writing "top" coordinate into the HTML-element attribute
            if (this.variables.get("top").active)
              this.#shell.style.setProperty(
                "--graph-node-top",
                this.#top + this.variables.get("top").type
              );

            // Writing "from-left" coordinate into the property
            this.#movement.from.left = this.#left;

            // Writing "from-top" coordinate into the property
            this.#movement.from.top = this.#top;

            // Writing "from-left" coordinate into the HTML-element attribute
            if (this.variables.get("from-left").active)
              this.#shell.style.setProperty(
                "--graph-node-from-left",
                this.#movement.from.left + this.variables.get("from-left").type
              );

            // Writing "from-top" coordinate into the HTML-element attribute
            if (this.variables.get("from-top").active)
              this.#shell.style.setProperty(
                "--graph-node-from-top",
                this.#movement.from.top + this.variables.get("from-top").type
              );

            // Writing "to-left" coordinate into the property
            this.#movement.to.left = this.#left;

            // Writing "to-top" coordinate into the property
            this.#movement.to.top = this.#top;

            // Writing "to-left" coordinate into the HTML-element attribute
            if (this.variables.get("to-left").active)
              this.#shell.style.setProperty(
                "--graph-node-to-left",
                this.#movement.to.left + this.variables.get("to-left").type
              );

            // Writing "to-top" coordinate into the HTML-element attribute
            if (this.variables.get("to-top").active)
              this.#shell.style.setProperty(
                "--graph-node-to-top",
                this.#movement.to.top + this.variables.get("to-top").type
              );

            // Writing z-coordinate into the HTML-element attribute
            if (instance.variables.get("layer").active)
              instance.#shell.style.setProperty(
                "--graph-node-layer",
                50 + instance.variables.get("layer").type
              );

            // Initializing coordinates
            const left = start.pageX - instance.shell.offsetLeft + pageXOffset;
            const top = start.pageY - instance.shell.offsetTop + pageYOffset;

            // Disconnecting deprecated event listener for moving the node
            document.removeEventListener(
              "mousemove",
              instance.#listeners.get("movement")
            );

            // Initializing event listener for moving the node
            instance.#listeners.set("movement", (moving) => {
              // Started moving

              // Moving the node
              instance.move(moving.pageX - left, moving.pageY - top);

              // Processing pushings by the node
              instance.push(
                graph.interactions.pushing.cascade.depth,
                graph.nodes
              );

              // Processing pullings by the node
              instance.pull(graph.interactions.pulling.cascade.depth);
            });

            // Connecting event listener for moving the node
            document.addEventListener(
              "mousemove",
              instance.#listeners.get("movement")
            );

            // Disconnecting deprecated event listener for ending moving the node
            document.removeEventListener(
              "mouseup",
              instance.#listeners.get("movement.end")
            );

            // Initializing event listener for ending movement the node
            instance.#listeners.set("movement.end", (end) => {
              // Ended movement

              // Disconnecting event listener for moving the node
              document.removeEventListener(
                "mousemove",
                instance.#listeners.get("movement")
              );

              // Disconnecting event listener for ending moving the node
              document.removeEventListener(
                "mouseup",
                instance.#listeners.get("movement.end")
              );

              // Writing status of the movement
              this.#movement.status = "completed";

              // Writing z-coordinate into the HTML-element attribute
              if (this.variables.get("layer").active)
                instance.#shell.style.setProperty(
                  "--graph-node-layer",
                  0 + this.variables.get("layer").type
                );

              // Dispatching event: "node.movement.ended"
              instance.#shell.dispatchEvent(
                new CustomEvent("graph.node.movement.ended", {
                  detail: {
                    node: instance
                  }
                })
              );
            });

            // Connecting event listener for ending moving the node
            document.addEventListener(
              "mouseup",
              instance.#listeners.get("movement.end")
            );
          }
        });

        // Connecting event listener for starting moving the node
        this.shell.addEventListener(
          "mousedown",
          this.#listeners.get("movement.start")
        );
      }
    }
  }

  /**
   * @name Deactivate
   *
   * @description
   * Deactivate the node for operating relative to `shell`
   **/
  deactivate() {
    // Writing z-coordinate into the HTML-element attribute
    if (this.variables.get("layer").active)
      this.#shell.style.setProperty(
        "--graph-node-layer",
        500 + this.variables.get("layer").type
      );

    // Disconnecting event listener for starting moving the node
    this.#shell.removeEventListener(
      "mousedown",
      this.#listeners.get("moving.start")
    );

    // Disconnecting event listener for moving the node
    document.removeEventListener("mousemove", this.#listeners.get("moving"));

    // Disconnecting event listener for ending moving the node
    document.removeEventListener("mouseup", this.#listeners.get("moving.end"));
  }

  /**
   * @name Move
   *
   * @description
   * Move the node and handle interactions with other nodes
   *
   * @param {number} left Offset from the left (px)
   * @param {number} top Offset from the top (px)
   **/
  async move(left, top) {
    if (this.interactions.movement.active) {
      // Activated moving

      if (typeof left === "number" && typeof top === "number") {
        // Received coordinates arguments

        // Writing "left" coordinate into the property
        this.#left = Math.round(left);

        // Writing "top" coordinate into the property
        this.#top = Math.round(top);

        // Writing "left" coordinate into the HTML-element attribute
        if (this.variables.get("left").active)
          this.#shell.style.setProperty(
            "--graph-node-left",
            this.#left + this.variables.get("left").type
          );

        // Writing "top" coordinate into the HTML-element attribute
        if (this.variables.get("top").active)
          this.#shell.style.setProperty(
            "--graph-node-top",
            this.#top + this.variables.get("top").type
          );

        if (this.#movement.status !== "completed") {
          // Not completed the movement

          // Initializing CSS-class for movement animation
          if (!this.#shell.classList.contains("movement"))
            this.#shell.classList.add("movement");

          // Deinitializing deprecated process for checking that the movement was completed
          if (this.#processes.has("movement"))
            clearInterval(this.#processes.get("movement"));

          // Initializing process for checking that the movement was completed
          this.#processes.set(
            "movement",
            setInterval(() => {
              if (
                this.#shell.offsetLeft === this.#movement.to.left &&
                this.#shell.offsetTop === this.#movement.to.top
              ) {
                // Completed the movement

                // Deinitializing CSS-class for movement animation (reset)
                this.#shell.classList.remove("movement");

                // Writing "from" coordinates into the property
                this.#movement.from = this.#movement.to;

                // Writing "from-left" coordinate into the HTML-element attribute
                if (this.variables.get("from-left").active)
                  this.#shell.style.setProperty(
                    "--graph-node-from-left",
                    this.#movement.from.left +
                      this.variables.get("from-left").type
                  );

                // Writing "from-top" coordinate into the HTML-element attribute
                if (this.variables.get("from-top").active)
                  this.#shell.style.setProperty(
                    "--graph-node-from-top",
                    this.#movement.from.top +
                      this.variables.get("from-top").type
                  );

                // Writing statuf of the movement
                this.#movement.status = "completed";

                // Deinitializing process for checking that the movement was completed
                clearInterval(this.#processes.get("movement"));
              }

              // Synchronize the node edges with the node
              this.synchronization();
            }, this.interactions.movement.synchronization.interval)
          );
        }

        // Writing status of the movement
        this.#movement.status = "moving";

        // Writing "to-left" coordinate into the property
        this.#movement.to.left = this.left;

        // Writing "to-top" coordinate into the property
        this.#movement.to.top = this.top;

        // Writing "to-left" coordinate into the HTML-element attribute
        if (this.variables.get("to-left").active)
          this.#shell.style.setProperty(
            "--graph-node-to-left",
            this.#movement.to.left + this.variables.get("to-left").type
          );

        // Writing "to-top" coordinate into the HTML-element attribute
        if (this.variables.get("to-top").active)
          this.#shell.style.setProperty(
            "--graph-node-to-top",
            this.#movement.to.top + this.variables.get("to-top").type
          );
      }

      // Synchronize the node edges with the node
      this.synchronization();
    }
  }

  /**
   * @name Push
   *
   * @description
   * Push `nodes` from the node
   *
   * @param {number} [depth=1] Amount of cascade reactions (the value will be reduced to 0 in recursion)
   * @param {(Set|Array|undefined)} [nodes=undefined] Nodes for processing (otherwise `this.inputs` + `this.outputs`)
   */
  async push(depth = 1, nodes) {
    if (
      typeof depth === "number" &&
      (nodes instanceof Set ||
        nodes instanceof Array ||
        typeof nodes === "undefined")
    ) {
      // Validated required argument

      if (--depth >= 0) {
        // Not reached iterations limit

        if (this.interactions.pushing.active) {
          // Activated pushing

          for (const node of (nodes?.size > 0 || nodes?.length > 0
            ? [...nodes]
            : [...this.inputs]
                .map((edge) => edge.from)
                .concat([...this.outputs].map((edge) => edge.to))
          ).filter((node) => node !== this)) {
            // Iterating over nodes

            if (node.interactions.pushing.active) {
              // Activated pushing

              // Initializing the vector between nodes
              const between = new Victor(
                node.center.left - this.center.left,
                node.center.top - this.center.top
              );

              // Calculation of the arithmetic mean of nodes pushing distance
              const distance =
                (node.interactions.pushing.distance +
                  this.interactions.pushing.distance) /
                2;

              // Calculating difference between needed distance and actial distance
              const difference =
                node.radius + this.radius + distance - between.length();

              if (difference > 0) {
                // The node have not overcome the pushing distance

                // Initializing vector of pushing distance
                const pushing = new Victor(difference, difference);

                // Generating vector for moving the target node
                const vector = new Victor(node.left, node.top).add(
                  pushing.rotate(between.angle() - pushing.angle())
                );

                // Moving the target node
                node.move(vector.x, vector.y);
              }

              // Processing pushings by the node (entering into recursion)
              node.push(depth, nodes);
            }
          }
        }
      }
    }
  }

  /**
   * @name Pull
   *
   * @description
   * Pull `nodes` to the node
   *
   * @param {number} [depth=1] Amount of cascade reactions (the value will be reduced to 0 in recursion)
   * @param {(Set|Array|undefined)} [nodes=undefined] Nodes for processing (otherwise `this.inputs` + `this.outputs`)
   */
  async pull(depth = 1, nodes) {
    if (
      typeof depth === "number" &&
      (nodes instanceof Set ||
        nodes instanceof Array ||
        typeof nodes === "undefined")
    ) {
      // Validated required argument

      if (--depth >= 0) {
        // Not reached iterations limit

        if (this.interactions.pulling.active) {
          // Activated pulling

          for (const node of (nodes?.size > 0 || nodes?.length > 0
            ? [...nodes]
            : [...this.inputs]
                .map((edge) => edge.from)
                .concat([...this.outputs].map((edge) => edge.to))
          ).filter((node) => node !== this)) {
            // Iterating over nodes

            if (node.interactions.pulling.active) {
              // Activated pulling

              // Initializing the vector between nodes
              const between = new Victor(
                node.center.left - this.center.left,
                node.center.top - this.center.top
              );

              // Calculation of the arithmetic mean of nodes pulling distance
              const distance =
                (node.interactions.pulling.distance +
                  this.interactions.pulling.distance) /
                2;

              // Calculating difference between needed distance and actial distance
              const difference =
                node.radius + this.radius + distance - between.length();

              if (difference <= 0) {
                // The node have not overcome the pulling distance

                // Initializing vector of pulling distance
                const pulling = new Victor(difference, difference);

                // Generating vector for moving the target node
                const vector = new Victor(node.left, node.top).add(
                  pulling.rotate(between.angle() - pulling.angle()).invert()
                );

                // Moving the target node
                node.move(vector.x, vector.y);
              }

              // Processing pullings by the node (entering into recursion)
              node.pull(depth, nodes);
            }
          }
        }
      }
    }
  }

  /**
   * @name Synchronization
   *
   * @description
   * Synchronize all the node edges with the node
   **/
  synchronization() {
    for (const edge of this.outputs) {
      // Iterating over the node outputs edges

      // Synchronizing the output edge with the node
      edge.synchronization(this);
    }

    for (const edge of this.inputs) {
      // Iterating over the node inputs edges

      // Synchronizing the input edge with the node
      edge.synchronization(this);
    }
  }
}

/**
 * @name Edge
 *
 * @description
 * Edge of the module for creating graphs
 *
 * {@link https://git.mirzaev.sexy/mirzaev/graph.mjs}
 *
 * @class
 * @public
 *
 * @license http://www.wtfpl.net/ Do What The Fuck You Want To Public License
 * @author Arsen Mirzaev Tatyano-Muradovich <arsen@mirzaev.sexy>
 *
 * @example <caption>Creating an edge</caption>
 * instance.edge(new edge(node_1, node_2));
 */
export class edge {
  /**
   * @name Shell
   *
   * @description
   * Shell of the edge
   *
   * @type {SVGElement}
   *
   * @protected
   */
  #shell;

  /**
   * @name Shell (get)
   *
   * @description
   * Getter for shell of the edge
   *
   * @type {SVGElement}
   *
   * @public
   */
  get shell() {
    return this.#shell;
  }

  /**
   * @name Line
   *
   * @description
   * The <line> element of the edge
   *
   * @type {SVGElement}
   *
   * @protected
   */
  #line;

  /**
   * @name Line (get)
   *
   * @description
   * Getter of the <line> element of the edge
   *
   * @type {SVGElement}
   *
   * @public
   */
  get line() {
    return this.#line;
  }

  /**
   * @name From
   *
   * @description
   * The node from which the edge comes
   *
   * @type {node}
   *
   * @protected
   */
  #from;

  /**
   * @name From (get)
   *
   * @description
   * Getter for the node from which the edge comes
   *
   * @type {node}
   *
   * @public
   */
  get from() {
    return this.#from;
  }

  /**
   * @name To
   *
   * @description
   * The node into which the edge enters
   *
   * @type {node}
   *
   * @protected
   */
  #to;

  /**
   * @name To (get)
   *
   * @description
   * Getter for the node into which the edge enters
   *
   * @type {node}
   *
   * @public
   */
  get to() {
    return this.#to;
  }

  /**
   * @name Constructor
   *
   * @description
   * Initialize an edge instance
   *
   * @param {node} from The node from which the edge comes
   * @param {node} to The node into which the edge enters
   **/
  constructor(from, to) {
    if (from instanceof node && to instanceof node) {
      // Validated required arguments

      if (
        from.shell instanceof HTMLElement &&
        to.shell instanceof HTMLElement
      ) {
        // Initialized shell elements

        // Writing nodes into properties
        this.#from = from;
        this.#to = to;

        // Writing the edge into nodes edges registries
        this.#from.outputs.add(this);
        this.#to.inputs.add(this);

        // Reinitializing augmented size of nodes
        this.#from.augment();
        this.#to.augment();

        // Reinitializing edges variables of nodes
        this.#from.edges();
        this.#to.edges();

        // Initializing the edge shell <svg> element
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );

        // Writing identifier of the edge shell <svg> element
        svg.setAttribute(
          "id",
          from.shell.getAttribute("id") + "_" + to.shell.getAttribute("id")
        );

        // Writing classes of the edge shell <svg> element
        svg.classList.add("edge");

        // Deinitializing the "dragstart" and the "selectstart" event listeners of the edge shell <svg> element
        svg.ondragstart = svg.onselectstart = null;

        // Initializing the edge <line> element
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

        // Writing coordinates of the edge <line> element
        line.setAttribute("x1", from.left + from.radius);
        line.setAttribute("y1", from.top + from.radius);
        line.setAttribute("x2", to.left + to.radius);
        line.setAttribute("y2", to.top + to.radius);

        // Writing the edge shell <svg> element into property
        this.#shell = svg;

        // Writing the edge <line> element into property
        this.#line = line;

        // Writing the edge <line> element into the edge shell <svg> element
        svg.append(line);
      }
    }
  }

  /**
   * Синхронизировать местоположение со связанным узлом
   *
   * @param {node} node Инстанция узла (связанного с соединением)
   */

  /**
   * @name Synchronization
   *
   * @description
   * Synchronize node and edge coordinates
   *
   * @param {node} node The node with which the edge will be synchronized
   **/
  async synchronization(node) {
    if (node === this.#from) {
      // Output connection

      // Writing coordinates (offsetLeft and offsetTop for CSS animations)
      this.#line?.setAttribute("x1", node.shell.offsetLeft + node.radius);
      this.#line?.setAttribute("y1", node.shell.offsetTop + node.radius);
    } else if (node === this.#to) {
      // Input connection

      // Writing coordinates (offsetLeft and offsetTop for CSS animations)
      this.#line?.setAttribute("x2", node.shell.offsetLeft + node.radius);
      this.#line?.setAttribute("y2", node.shell.offsetTop + node.radius);
    }
  }
}
