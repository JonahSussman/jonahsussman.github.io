let html = /* html */ `
<nav class="navbar navbar-expand-lg navbar-light bg-light mb-3" style="border-bottom: 1px solid #e5e5e5;">
  <div class="container-fluid" style="max-width: 1333px; margin: 0 auto;">
    <a class="navbar-brand blog-header-logo" href="/">Jonah Sussman</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item px-2">
          <a class="nav-link" href="/">Home</a>
        </li>
        <li class="nav-ite px-2">
          <a class="nav-link" href="about">About</a>
        </li>
        <li class="nav-item px-2">
          <a class="nav-link" href="projects">Projects</a>
        </li>
        <li class="nav-item px-2">
          <a class="nav-link" href="assets/Jonah Sussman Resume ONLINE 2020-12-20.pdf">Resume</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
`;

class JNav extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = html;
  }
}

customElements.define('j-nav', JNav);