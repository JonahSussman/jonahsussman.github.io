function navResponse() {
  let m = document.getElementById("nav-menu");
  m.className = m.className === "" ? "active" : "";

  let btn = document.getElementById("nav-toggle");
  btn.setAttribute("class", btn.getAttribute("class") === "" ? "active" : "");
}

function rb(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let html = /* html */ `
<div class="nav-flex">
  <svg id="nav-toggle" class="" viewBox="0 0 100 100" width="2.25rem" height="2.25rem">
    <rect y="10"  width="100" height="20" rx="10"></rect>
    <rect y="40" width="100" height="20" rx="10"></rect>
    <rect y="70" width="100" height="20" rx="10"></rect>
  </svg>
  <a class="nav-logo crazy-jonah" href="/">Jonah Sussman</a>
  <ul id="nav-menu">
    <li><a class="nav-link" href="/">Home</a></li>
    <li><a class="nav-link" href="/about">About</a></li>
    <li><a class="nav-link" href="/projects">Projects</a></li>
    <li><a class="nav-link" href="/assets/Jonah%20Sussman%20Resume%20ONLINE%202020-12-20.pdf">Resume</a></li>
  </ul>
</div>
`;

class JNav extends HTMLElement {
  constructor() {
    super();
    this.className = "";
    this.id = "navbar";
    this.innerHTML = html;

    document.getElementById("nav-toggle").addEventListener("click", navResponse, false);
  }
}

customElements.define('j-nav', JNav);