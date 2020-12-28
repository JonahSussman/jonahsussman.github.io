function navResponse() {
  let x = document.getElementById("mainnav");
  if (x.className === "mainnav") {
    x.className = "mainnav responsive";
  } else {
    x.className = "mainnav";
  }
}

let html = /* html */ `
<ul>
  <h2><a href="/">Jonah Sussman</a></h2>
  <li id="navburger">
    <a id="linavburger" href="javascript:void(0);" onclick="navResponse()" style="fill: white;">
      <svg viewBox="0 0 100 100" width="30" height="30">
        <rect width="100" height="20" rx="10"></rect>
        <rect y="30" width="100" height="20" rx="10"></rect>
        <rect y="60" width="100" height="20" rx="10"></rect>
      </svg>
    </a>
  </li>
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
  <li><a href="/projects">Projects</a></li>
  <li><a href="/assets/Jonah%20Sussman%20Resume%20ONLINE%202020-12-20.pdf">Resume</a></li>
</ul>
`;

class JNav extends HTMLElement {
  constructor() {
    super();
    this.className = "mainnav responsive";
    this.id = "mainnav";
    this.innerHTML = html;

    document.getElementById("linavburger").addEventListener("click", navResponse, false);
  }
}

customElements.define('j-nav', JNav);