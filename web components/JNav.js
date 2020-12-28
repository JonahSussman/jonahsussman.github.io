function navResponse() {
  let x = document.getElementById("mainnav");
  if (x.className === "mainnav") {
    x.className = "mainnav responsive";
  } else {
    x.className = "mainnav";
  }
}

function rb(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let html = /* html */ `
<ul>
  <h2 class="crazy-jonah"><a href="/">Jonah Sussman</a></h2>
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

// let colors = [
//   'hsl(171, 100%, 41%)',
//   'hsl(217, 71%, 53%)',
//   'hsl(204, 86%, 53%)',
//   'hsl(141, 53%, 53%)',
//   'hsl(48, 100%, 67%)',
//   'hsl(348, 100%, 61%)'
// ];

// let arr = [];

// while (arr.length < 3) {
//   let r = 0;
//   do {
//     r = rb(0, colors.length - 1);
//   } while (arr.includes(r));
//   arr.push(r);
// }

// let css = /* css */`.crazy-jonah:hover { text-shadow: ${rb(-9, 9)}px ${rb(-9, 9)}px ${colors[arr[0]]}, ${rb(-9, 9)}px ${rb(-9, 9)}px ${colors[arr[1]]}, ${rb(-9, 9)}px ${rb(-9, 9)}px ${colors[arr[2]]};}`;

class JNav extends HTMLElement {
  constructor() {
    super();
    this.className = "mainnav responsive";
    this.id = "mainnav";
    this.innerHTML = html;

    // let styleSheet = document.createElement("style");
    // styleSheet.type = "text/css";
    // styleSheet.innerText = css;
    // document.head.appendChild(styleSheet);

    document.getElementById("linavburger").addEventListener("click", navResponse, false);
  }
}

customElements.define('j-nav', JNav);