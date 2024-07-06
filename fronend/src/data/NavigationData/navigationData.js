export const navigation = {
  categories: [
    {
      id: "men",
      name: "Men",
      featured: [
        {
          name: "Everyday Footwear",
          href: "#",
          imageSrc:
            "https://images.pexels.com/photos/19577862/pexels-photo-19577862/free-photo-of-men-shoes-creative-for-e-commerce.jpeg",
          imageAlt:
            "Collection of everyday footwear including loafers, flats, and casual shoes.",
        },
        {
          name: "Classic Sneakers",
          href: "#",
          imageSrc:
            "https://images.pexels.com/photos/718981/pexels-photo-718981.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
          imageAlt: "Various classic sneakers in different colors and styles.",
        },
      ],
      sections: [
        {
          id: "shoes",
          name: "Shoes",
          items: [
            { id: "sneakers", name: "Sneakers", href: "#" },
            { id: "boots", name: "Boots", href: "#" },
            { id: "dressshoes", name: "Dress Shoes", href: "#" },
            { id: "loafers", name: "Loafers", href: "#" },
            { id: "slippers", name: "Slippers", href: "#" },
            { id: "athleticshoes", name: "Athletic Shoes", href: "#" },
  
          ],
        },
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { id: "shirts", name: "Shirts", href: "#" },
            { id: "pants", name: "Pants", href: "#" },
            { id: "jackets", name: "Jackets", href: "#" },
           
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { id: "belts", name: "Belts", href: "#" },
            { id: "wallets", name: "Wallets", href: "#" },
            { id: "ties", name: "Ties", href: "#" },
            { id: "hats", name: "Hats", href: "#" },
            { id: "sunglasses", name: "Sunglasses", href: "#" },
          ],
        },
        
      ],
    },
    {
      id: "women",
      name: "Women",
      featured: [
        {
          name: "Stylish Heels",
          href: "#",
          imageSrc:
            "https://media.istockphoto.com/id/938463764/photo/fits-perfect.jpg?s=612x612&w=0&k=20&c=fEaAzZ519zmLohQ9RFIQvMGQ8hkE5RfA7jZ1SoSRsL8=",
          imageAlt:
            "Various stylish high heels in different colors and designs.",
        },
        {
          name: "Athletic Sneakers",
          href: "#",
          imageSrc:
            "https://images.pexels.com/photos/9692165/pexels-photo-9692165.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
          imageAlt:
            "Variety of athletic sneakers designed for workouts and active lifestyle.",
        },
      ],
      sections: [
        {
          id: "shoes",
          name: "Shoes",
          items: [
            { id: "sandals", name: "Sandals", href: "#" },
            { id: "heels", name: "Heels", href: "#" },
            { id: "flats", name: "Flats", href: "#" },
            { id: "boots", name: "Boots", href: "#" },
           
          ],
        },

        {
          id: "clothing",
          name: "Clothing",
          items: [
            { id: "dresses", name: "Dresses", href: "#" },
            { id: "tops", name: "Tops", href: "#" },
            { id: "pants", name: "Pants", href: "#" },
            { id: "jackets", name: "Jackets", href: "#" },
           
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { id: "handbags", name: "Handbags", href: "#" },
            { id: "scarves", name: "Scarves", href: "#" },
            { id: "jewelry", name: "Jewelry", href: "#" },
            { id: "hats", name: "Hats", href: "#" },
            { id: "sunglasses", name: "Sunglasses", href: "#" },
          ],
        },
      ],
    },
  ],
  pages: [
    { id: "stores", name: "Products", href: "/products" },
    { id: "contactus", name: "Contact Us", href: "/contact-us" },
    
  ],  
};




// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllCategories } from '../../State/Category/Action';

// export const Navigation = () => {
//   const dispatch = useDispatch();
//   const { categories, loading, error } = useSelector(state => state.categories);

//   useEffect(() => {
//     dispatch(getAllCategories());
//   }, [dispatch]);

//   const mapCategories = (categories) => {
//     const level1 = categories?.filter(cat => cat?.level === 1);
//     return level1.map(cat1 => ({
//       id: cat1?._id,
//       name: cat1?.name,
//       sections: categories
//         ?.filter(cat2 => cat2?.level === 2 && cat2?.parentCategory === cat1?._id)
//         ?.map(cat2 => ({
//           id: cat2?._id,
//           name: cat2?.name,
//           items: categories
//             ?.filter(cat3 => cat3?.level === 3 && cat3?.parentCategory === cat2?._id)
//             ?.map(cat3 => ({ id: cat3?._id, name: cat3?.name, href: "#" }))
//         }))
//     }));
//   };

//   return {
//     categories: mapCategories(categories),
//     pages: [
//       { id: "stores", name: "Products", href: "/products" },
//       { id: "about", name: "About", href: "/about" },
//     ],
//   };
// };

// export default Navigation;
// ;
