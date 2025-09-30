import { Product } from '../types/pos';

export const PRODUCTS: Product[] = [
  // Combinados
  {
    id: 'combinado-clasico',
    name: 'Combinado Clasico',
    price: 27700,
    category: 'rolls',
    description: '30 piezas frias + 4 arrollados primavera',
    available: true
  },
  {
    id: 'roll-philadelphia',
    name: 'Roll Philadelphia',
    price: 3200,
    category: 'rolls',
    description: 'Salmón, queso crema, cebollín',
    available: true
  },
  {
    id: 'roll-tempura',
    name: 'Roll Tempura',
    price: 2900,
    category: 'rolls',
    description: 'Langostino tempura, palta, mayo',
    available: true
  },
  {
    id: 'roll-veggie',
    name: 'Roll Veggie',
    price: 2400,
    category: 'rolls',
    description: 'Palta, pepino, zanahoria, rúcula',
    available: true
  },

  // Entradas
  {
    id: 'gyoza-pollo',
    name: 'Gyoza de Pollo',
    price: 1800,
    category: 'entradas',
    description: '6 unidades con salsa ponzu',
    available: true
  },
  {
    id: 'edamame',
    name: 'Edamame',
    price: 1200,
    category: 'entradas',
    description: 'Porotos de soja con sal marina',
    available: true
  },
  {
    id: 'ensalada-wakame',
    name: 'Ensalada Wakame',
    price: 1600,
    category: 'entradas',
    description: 'Algas wakame con sésamo',
    available: true
  },

  // Bebidas
  {
    id: 'coca-cola',
    name: 'Coca Cola',
    price: 800,
    category: 'bebidas',
    description: '500ml',
    available: true
  },
  {
    id: 'agua-mineral',
    name: 'Agua Mineral',
    price: 600,
    category: 'bebidas',
    description: '500ml',
    available: true
  },
  {
    id: 'te-verde',
    name: 'Té Verde',
    price: 700,
    category: 'bebidas',
    description: 'Té verde japonés',
    available: true
  },
  {
    id: 'cerveza-stella',
    name: 'Cerveza Stella',
    price: 1200,
    category: 'bebidas',
    description: '473ml',
    available: true
  },

  // Postres
  {
    id: 'mochi-chocolate',
    name: 'Mochi Chocolate',
    price: 1400,
    category: 'postres',
    description: '3 unidades',
    available: true
  },
  {
    id: 'helado-te-verde',
    name: 'Helado Té Verde',
    price: 1600,
    category: 'postres',
    description: 'Helado artesanal',
    available: true
  },

  // Extras
  {
    id: 'salsa-soja',
    name: 'Salsa de Soja',
    price: 200,
    category: 'extras',
    description: 'Porción adicional',
    available: true
  },
  {
    id: 'wasabi',
    name: 'Wasabi',
    price: 300,
    category: 'extras',
    description: 'Porción adicional',
    available: true
  }
];

export const CATEGORIES = [
  { id: 'rolls', name: 'Rolls', icon: '🍣' },
  { id: 'entradas', name: 'Entradas', icon: '🥟' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'postres', name: 'Postres', icon: '🍨' },
  { id: 'extras', name: 'Extras', icon: '🥢' }
] as const;