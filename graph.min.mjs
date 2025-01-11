import t from"https://cdn.skypack.dev/victor@1.1.0";
"use strict";/**
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
export default class core{#t;get shell(){return this.#t}#e;get left(){return this.#e}#s;get top(){return this.#s}#i=new Set;get nodes(){return this.#i}#o=new Set;get edges(){return this.#o}interactions={moving:{graph:{active:!0,inertion:{active:!0}},nodes:{active:!0,inertion:{active:!0}}},pushing:{active:!0,iterations:{from:0,to:100},cascade:{depth:3}},pulling:{active:!0,iterations:{from:0,to:100},cascade:{depth:3}}};#n;set living(t){if("number"==typeof t||void 0===t){this.#n=t,clearInterval(this.#r.get("living"));const e=this;"number"==typeof this.#n&&0!==this.#n&&this.#r.set("living",setInterval((()=>{for(const t of this.#i)t.push(e.interactions.pushing.cascade.depth,e.nodes),t.pull(e.interactions.pulling.cascade.depth)}),this.#n))}}get living(){return this.#n}#a=!1;set camera(t){if("boolean"==typeof t)if(this.#a=t,this.#a){this.#t.ondragstart=this.#t.onselectstart=null;const t=this;document.removeEventListener("mousedown",this.#l.get("camera.start")),this.#l.set("camera.start",(e=>{if(e.target===t.#t||!t.#t.contains(event.target)){const s=e.pageX-t.#t.offsetLeft+pageXOffset,i=e.pageY-t.#t.offsetTop+pageYOffset;document.removeEventListener("mousemove",t.#l.get("camera.moving")),this.#l.set("camera.moving",(e=>{t.#e=e.pageX-s,t.#s=e.pageY-i,t.variables.get("left").active&&t.#t.style.setProperty("--graph-shell-left",t.#e+t.variables.get("left").type),t.variables.get("top").active&&t.#t.style.setProperty("--graph-shell-top",t.#s+t.variables.get("top").type)})),document.addEventListener("mousemove",t.#l.get("camera.moving"))}})),document.addEventListener("mousedown",this.#l.get("camera.start")),document.removeEventListener("mouseup",this.#l.get("camera.end")),this.#l.set("camera.end",(e=>{document.removeEventListener("mousemove",t.#l.get("camera.moving"))})),document.addEventListener("mouseup",this.#l.get("camera.end"))}else document.removeEventListener("mousedown",this.#l.get("camera.start")),document.removeEventListener("mouseup",this.#l.get("camera.end")),document.removeEventListener("mousemove",this.#l.get("camera.moving"))}get camera(){return this.#a}#h=!1;set operate(t){if("boolean"==typeof t)if(this.#h=t,this.#h)for(const t of this.#i)t.activate(this);else for(const t of this.#i)t.deactivate()}get operate(){return this.#h}variables=new Map([["left",{active:!0,type:"px"}],["top",{active:!0,type:"px"}]]);#l=new Map;#r=new Map;constructor(t){t instanceof HTMLElement&&(this.#t=t,this.#t.ondragstart=this.#t.onselectstart=null)}node(t){return t instanceof node&&(t.move(this.#t.offsetWidth/2-t.augmented/2+500*(.5-Math.random()),this.#t.offsetHeight/2-t.augmented/2+500*(.5-Math.random())),this.#i.add(t),this.#h&&t.activate(this),t)}edge(t){return t instanceof edge&&this.#t instanceof HTMLElement&&t.shell instanceof SVGElement&&(this.#t.appendChild(t.shell),this.#o.add(t),t)}}
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
 */export class node{#t;get shell(){return this.#t}#e;get left(){return this.#e||0}#s;get top(){return this.#s||0}#p={status:status,from:{left:0,top:0},to:{left:0,top:0}};#m=new Set;get inputs(){return this.#m}#c=new Set;get outputs(){return this.#c}button=0;size=100;#v;get augmented(){return this.#v||this.size||0}get radius(){return this.augmented/2||0}get center(){return{left:this.radius+this.left,top:this.radius+this.top}}addition=20;subtraction=5;interactions={movement:{active:!0,synchronization:{interval:20}},pushing:{active:!0,distance:100},pulling:{active:!0,distance:130}};variables=new Map([["left",{active:!1,type:"px"}],["top",{active:!1,type:"px"}],["from-left",{active:!0,type:"px"}],["from-top",{active:!0,type:"px"}],["to-left",{active:!0,type:"px"}],["to-top",{active:!0,type:"px"}],["layer",{active:!0,type:""}],["size",{active:!1,type:"px"}],["augmented",{active:!0,type:"px"}],["inputs",{active:!0,type:""}],["outputs",{active:!1,type:""}]]);#l=new Map;#r=new Map;constructor(t){t instanceof HTMLElement&&(this.#t=t,this.#t.ondragstart=this.#t.onselectstart=null,this.augment(),this.edges())}augment(){this.#v=this.size+(this.addition*this.#m.size-this.subtraction*this.#c.size),this.variables.get("augmented").active&&this.#t?.style.setProperty("--graph-node-augmented",this.#v+this.variables.get("augmented").type)}edges(){this.variables.get("inputs").active&&this.#t?.style.setProperty("--graph-node-inputs",this.#m.size+this.variables.get("inputs").type),this.variables.get("outputs").active&&this.#t?.style.setProperty("--graph-node-outputs",this.#c.size+this.variables.get("outputs").type)}activate(t){if(t instanceof core&&this.#t instanceof HTMLElement){const e=this;this.#t.removeEventListener("mousedown",this.#l.get("movement.start")),this.#l.set("movement.start",(s=>{if("touchstart"===s.type||s.button===e.button){this.#r.has("movement")&&clearInterval(this.#r.get("movement")),this.#e=Math.round(this.#t.offsetLeft),this.#s=Math.round(this.#t.offsetTop),this.variables.get("left").active&&this.#t.style.setProperty("--graph-node-left",this.#e+this.variables.get("left").type),this.variables.get("top").active&&this.#t.style.setProperty("--graph-node-top",this.#s+this.variables.get("top").type),this.#p.from.left=this.#e,this.#p.from.top=this.#s,this.variables.get("from-left").active&&this.#t.style.setProperty("--graph-node-from-left",this.#p.from.left+this.variables.get("from-left").type),this.variables.get("from-top").active&&this.#t.style.setProperty("--graph-node-from-top",this.#p.from.top+this.variables.get("from-top").type),this.#p.to.left=this.#e,this.#p.to.top=this.#s,this.variables.get("to-left").active&&this.#t.style.setProperty("--graph-node-to-left",this.#p.to.left+this.variables.get("to-left").type),this.variables.get("to-top").active&&this.#t.style.setProperty("--graph-node-to-top",this.#p.to.top+this.variables.get("to-top").type),e.variables.get("layer").active&&e.#t.style.setProperty("--graph-node-layer",50+e.variables.get("layer").type);const i=s.pageX-e.shell.offsetLeft+pageXOffset,o=s.pageY-e.shell.offsetTop+pageYOffset;document.removeEventListener("mousemove",e.#l.get("movement")),e.#l.set("movement",(s=>{e.move(s.pageX-i,s.pageY-o),e.push(t.interactions.pushing.cascade.depth,t.nodes),e.pull(t.interactions.pulling.cascade.depth)})),document.addEventListener("mousemove",e.#l.get("movement")),document.removeEventListener("mouseup",e.#l.get("movement.end")),e.#l.set("movement.end",(t=>{document.removeEventListener("mousemove",e.#l.get("movement")),document.removeEventListener("mouseup",e.#l.get("movement.end")),this.#p.status="completed",this.variables.get("layer").active&&e.#t.style.setProperty("--graph-node-layer",0+this.variables.get("layer").type),e.#t.dispatchEvent(new CustomEvent("graph.node.movement.ended",{detail:{node:e}}))})),document.addEventListener("mouseup",e.#l.get("movement.end"))}})),this.shell.addEventListener("mousedown",this.#l.get("movement.start"))}}deactivate(){this.variables.get("layer").active&&this.#t.style.setProperty("--graph-node-layer",500+this.variables.get("layer").type),this.#t.removeEventListener("mousedown",this.#l.get("moving.start")),document.removeEventListener("mousemove",this.#l.get("moving")),document.removeEventListener("mouseup",this.#l.get("moving.end"))}async move(t,e){this.interactions.movement.active&&("number"==typeof t&&"number"==typeof e&&(this.#e=Math.round(t),this.#s=Math.round(e),this.variables.get("left").active&&this.#t.style.setProperty("--graph-node-left",this.#e+this.variables.get("left").type),this.variables.get("top").active&&this.#t.style.setProperty("--graph-node-top",this.#s+this.variables.get("top").type),"completed"!==this.#p.status&&(this.#t.classList.contains("movement")||this.#t.classList.add("movement"),this.#r.has("movement")&&clearInterval(this.#r.get("movement")),this.#r.set("movement",setInterval((()=>{this.#t.offsetLeft===this.#p.to.left&&this.#t.offsetTop===this.#p.to.top&&(this.#t.classList.remove("movement"),this.#p.from=this.#p.to,this.variables.get("from-left").active&&this.#t.style.setProperty("--graph-node-from-left",this.#p.from.left+this.variables.get("from-left").type),this.variables.get("from-top").active&&this.#t.style.setProperty("--graph-node-from-top",this.#p.from.top+this.variables.get("from-top").type),this.#p.status="completed",clearInterval(this.#r.get("movement"))),this.synchronization()}),this.interactions.movement.synchronization.interval))),this.#p.status="moving",this.#p.to.left=this.left,this.#p.to.top=this.top,this.variables.get("to-left").active&&this.#t.style.setProperty("--graph-node-to-left",this.#p.to.left+this.variables.get("to-left").type),this.variables.get("to-top").active&&this.#t.style.setProperty("--graph-node-to-top",this.#p.to.top+this.variables.get("to-top").type)),this.synchronization())}async push(e=1,s){if("number"==typeof e&&(s instanceof Set||s instanceof Array||void 0===s)&&--e>=0&&this.interactions.pushing.active)for(const i of(s?.size>0||s?.length>0?[...s]:[...this.inputs].map((t=>t.from)).concat([...this.outputs].map((t=>t.to)))).filter((t=>t!==this)))if(i.interactions.pushing.active){const o=new t(i.center.left-this.center.left,i.center.top-this.center.top),n=(i.interactions.pushing.distance+this.interactions.pushing.distance)/2,r=i.radius+this.radius+n-o.length();if(r>0){const e=new t(r,r),s=new t(i.left,i.top).add(e.rotate(o.angle()-e.angle()));i.move(s.x,s.y)}i.push(e,s)}}async pull(e=1,s){if("number"==typeof e&&(s instanceof Set||s instanceof Array||void 0===s)&&--e>=0&&this.interactions.pulling.active)for(const i of(s?.size>0||s?.length>0?[...s]:[...this.inputs].map((t=>t.from)).concat([...this.outputs].map((t=>t.to)))).filter((t=>t!==this)))if(i.interactions.pulling.active){const o=new t(i.center.left-this.center.left,i.center.top-this.center.top),n=(i.interactions.pulling.distance+this.interactions.pulling.distance)/2,r=i.radius+this.radius+n-o.length();if(r<=0){const e=new t(r,r),s=new t(i.left,i.top).add(e.rotate(o.angle()-e.angle()).invert());i.move(s.x,s.y)}i.pull(e,s)}}synchronization(){for(const t of this.outputs)t.synchronization(this);for(const t of this.inputs)t.synchronization(this)}}
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
 */export class edge{#t;get shell(){return this.#t}#u;get line(){return this.#u}#g;get from(){return this.#g}#f;get to(){return this.#f}constructor(t,e){if(t instanceof node&&e instanceof node&&t.shell instanceof HTMLElement&&e.shell instanceof HTMLElement){this.#g=t,this.#f=e,this.#g.outputs.add(this),this.#f.inputs.add(this),this.#g.augment(),this.#f.augment(),this.#g.edges(),this.#f.edges();const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("id",t.shell.getAttribute("id")+"_"+e.shell.getAttribute("id")),s.classList.add("edge"),s.ondragstart=s.onselectstart=null;const i=document.createElementNS("http://www.w3.org/2000/svg","line");i.setAttribute("x1",t.left+t.radius),i.setAttribute("y1",t.top+t.radius),i.setAttribute("x2",e.left+e.radius),i.setAttribute("y2",e.top+e.radius),this.#t=s,this.#u=i,s.append(i)}}async synchronization(t){t===this.#g?(this.#u?.setAttribute("x1",t.shell.offsetLeft+t.radius),this.#u?.setAttribute("y1",t.shell.offsetTop+t.radius)):t===this.#f&&(this.#u?.setAttribute("x2",t.shell.offsetLeft+t.radius),this.#u?.setAttribute("y2",t.shell.offsetTop+t.radius))}}