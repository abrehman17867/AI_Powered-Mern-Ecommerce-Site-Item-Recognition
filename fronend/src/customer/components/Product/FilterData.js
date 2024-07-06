export const color = [
  "white",
  "Black",
  "Red",
  "Gray",
  "Green",
  "Pink",
  "Yellow",
  "Blue",
];

export const filters = [
  {
    id: "color",
    name: "Color",
    options: [
      { value: "white", label: "White" },
      { value: "black", label: "Black" },
      { value: "blue", label: "Blue" },
      { value: "brown", label: "Brown" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
      { value: "yellow", label: "Yellow" },
    ],
  },
  {
    id: "size",
    name: "Size",
    options: [
      { value: "S", label: "Small" },
      { value: "M", label: "Medium" },
      { value: "L", label: "Large" },
    ],
  },
 
];

export const singleFilter = [
  {
    id: "price",
    name: "Price",
    options: [
      { value: "0-50", label: "$0 to $50" },
      { value: "50-100", label: "$50 to $100" },
      { value: "100-150", label: "$100 to $150" },
      { value: "150-200", label: "$150 to $200" },
      { value: "200-250", label: "$200 to $250" },
      { value: "250-300", label: "$250 to $300" },
    ],
  },
  {
    id: "discount",
    name: "Discount Range",
    options: [
      { value: "10", label: "10% And Above" },
      { value: "20", label: "20% And Above" },
      { value: "30", label: "30% And Above" },
      { value: "40", label: "40% And Above" },
      { value: "50", label: "50% And Above" },
      { value: "60", label: "60% And Above" },
      { value: "70", label: "70% And Above" },
      { value: "80", label: "80% And Above" },
    ],
  },
  {
    id: "stock",
    name: "Availability",
    options: [
      { value: "in_of_stock", label: "In Stock" },
      { value: "out_of_stock", label: "Out Of Stock" },
    ],
  },
];

export const sortOptions = [
  { name: "Price: Low to High", query: "price_low", current: false },
  { name: "Price: High to Low", query: "price_high", current: false },
];
