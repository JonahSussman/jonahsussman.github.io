let html = /* html */ `
<footer>
  <p>${new Date().getFullYear()} | Made with 💖 by Jonah Sussman</p>
  <p><a href="#">Back to top</a></p>
</footer>
`;

class JFooter extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = html;
    this.classList.add('mt-auto', 'blog-footer');
  }
}

customElements.define('j-footer', JFooter);