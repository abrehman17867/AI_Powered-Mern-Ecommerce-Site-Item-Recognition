const seedCatalog = {
  categories: [
    {
      name: "Men",
      children: [
        {
          name: "Shoes",
          children: ["Sneakers", "Boots", "Loafers"],
        },
        {
          name: "Clothing",
          children: ["Shirts", "Jackets"],
        },
      ],
    },
    {
      name: "Women",
      children: [
        {
          name: "Shoes",
          children: ["Heels", "Flats", "Running Shoes"],
        },
        {
          name: "Accessories",
          children: ["Bags", "Sunglasses"],
        },
      ],
    },
  ],
  products: [
    {
      title: "Urban Runner X1",
      brand: "Stride",
      description: "Everyday lightweight sneakers for city commutes.",
      color: "Black",
      price: 120,
      discountedPrice: 95,
      discountedPersent: 21,
      quantity: 60,
      sizes: [
        { name: "S", quantity: 20 },
        { name: "M", quantity: 20 },
        { name: "L", quantity: 20 },
      ],
      imageUrl:
        "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200",
      categoryPath: ["Men", "Shoes", "Sneakers"],
    },
    {
      title: "Classic Leather Loafer",
      brand: "Monarch",
      description: "Formal loafers with soft-cushion insole.",
      color: "Brown",
      price: 140,
      discountedPrice: 119,
      discountedPersent: 15,
      quantity: 48,
      sizes: [
        { name: "S", quantity: 16 },
        { name: "M", quantity: 16 },
        { name: "L", quantity: 16 },
      ],
      imageUrl:
        "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
      categoryPath: ["Men", "Shoes", "Loafers"],
    },
    {
      title: "FlexFit Performance Tee",
      brand: "Pulse",
      description: "Breathable performance t-shirt for active wear.",
      color: "Navy",
      price: 49,
      discountedPrice: 39,
      discountedPersent: 20,
      quantity: 120,
      sizes: [
        { name: "S", quantity: 40 },
        { name: "M", quantity: 40 },
        { name: "L", quantity: 40 },
      ],
      imageUrl:
        "https://images.pexels.com/photos/6311626/pexels-photo-6311626.jpeg?auto=compress&cs=tinysrgb&w=1200",
      categoryPath: ["Men", "Clothing", "Shirts"],
    },
    {
      title: "Aero Glide Heels",
      brand: "Velora",
      description: "Elegant heels with all-day comfort support.",
      color: "Red",
      price: 130,
      discountedPrice: 102,
      discountedPersent: 22,
      quantity: 50,
      sizes: [
        { name: "S", quantity: 17 },
        { name: "M", quantity: 17 },
        { name: "L", quantity: 16 },
      ],
      imageUrl:
        "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1200",
      categoryPath: ["Women", "Shoes", "Heels"],
    },
    {
      title: "Daylight Everyday Tote",
      brand: "Nexa",
      description: "Spacious tote for daily essentials and travel.",
      color: "Cream",
      price: 89,
      discountedPrice: 72,
      discountedPersent: 19,
      quantity: 75,
      sizes: [
        { name: "One Size", quantity: 75 },
      ],
      imageUrl:
        "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1200",
      categoryPath: ["Women", "Accessories", "Bags"],
    },
  ],
};

module.exports = seedCatalog;
