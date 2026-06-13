import { MitaElement } from '../../utils/MitaElement.js';
import htmlTemplate from './demo-acerca.html?raw';
import './demo-acerca.css';

export class DemoAcerca extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
  }
}

if (!customElements.get('demo-acerca')) {
  customElements.define('demo-acerca', DemoAcerca);
}
