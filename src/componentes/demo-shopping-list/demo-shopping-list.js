// @ts-check
import { Signal, SignalDerivado } from 'mita-dom';
import { MitaElement } from '../../utils/MitaElement.js';
import html from './demo-shopping-list.html?raw';
import './demo-shopping-list.css';

// Simulamos los datos inmutables estilo React
const products = [
  { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 },
  { title: 'Banana', isFruit: true, id: 4 },
];

export class DemoShoppingList extends MitaElement {
  constructor() {
    super();
    // Estado Local: Almacena el filtro activo ('todas' | 'frutas')
    this.filtroActivo = new Signal('todas');
    
    // Derivamos la lista filtrada basándonos en el filtroActivo
    this.productosFiltrados = new SignalDerivado(this.filtroActivo, (filtro) => {
      if (filtro === 'frutas') return products.filter(p => p.isFruit);
      return products;
    });
  }

  async render() {
    this.innerHTML = html;
    this.iniciarLogica();
  }

  iniciarLogica() {
    this.$btnTodas = this.querySelector('#btn-todas');
    this.$btnFrutas = this.querySelector('#btn-frutas');
    this.$lista = this.querySelector('#lista-productos');

    // Eventos
    this.$btnTodas.addEventListener('click', () => this.filtroActivo.set('todas'));
    this.$btnFrutas.addEventListener('click', () => this.filtroActivo.set('frutas'));

    // Suscripción al Computed (Solo repinta la lista cuando cambia el filtro)
    this.productosFiltrados.suscribir((lista) => this._renderLista(lista));
    
    // Suscripción al UI del filtro (Cambiar clases)
    this.filtroActivo.suscribir((filtro) => {
      if (filtro === 'todas') {
        this.$btnTodas.classList.add('activo');
        this.$btnFrutas.classList.remove('activo');
      } else {
        this.$btnTodas.classList.remove('activo');
        this.$btnFrutas.classList.add('activo');
      }
    });
  }

  // Renderizado dinámico puro con DocumentFragment para máxima velocidad
  _renderLista(lista) {
    // Vaciamos el contenedor actual de forma rápida
    this.$lista.textContent = '';
    
    // Usamos un fragmento para no causar reflows en cada iteración
    const fragmento = document.createDocumentFragment();

    lista.forEach(product => {
      const li = document.createElement('li');
      li.className = `producto-item ${product.isFruit ? 'es-fruta' : 'no-fruta'}`;
      
      const emoji = product.isFruit ? '🍎' : '🥬';
      li.textContent = `${emoji} ${product.title}`;
      
      fragmento.appendChild(li);
    });

    this.$lista.appendChild(fragmento);
  }
}

if (!customElements.get('demo-shopping-list')) {
  customElements.define('demo-shopping-list', DemoShoppingList);
}
