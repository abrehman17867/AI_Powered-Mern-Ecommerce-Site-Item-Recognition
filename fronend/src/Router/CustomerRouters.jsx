import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../customer/pages/HomePage/HomePage";
import Cart from "../customer/components/Cart/Cart";
import Navigation from "../customer/components/navigation/Navigation";
import Product from "../customer/components/Product/Product";
import ProductDetails from "../customer/components/ProductDetails/ProductDetails";
import CheckOut from "../customer/components/CheckOut/CheckOut";
import Order from "../customer/components/Order/Order";

import Footer from "../customer/components/Footer/Footer";
import OrderDetails from "../customer/components/Order/OrderDetails";

import ProfilePage from "../Admin/components/UserDetails";
import RatingsReviewsPage from "../customer/pages/Ratings and Reviews/RatingsReviewsPage";
import AllProducts from "../customer/components/Product/AllProducts";
import SuccessPage from "../customer/pages/PaymentPages/PaymentSuccessPage";
import PaymentCancelPage from "../customer/pages/PaymentPages/PaymentCancelPage";
import ContactUs from "../customer/pages/AboutPage/ContactUs";

const CustomerRouters = () => {
  return (
    <div>
      <div>
        <Navigation />
      </div>
      <Routes>
        <Route path="/login" element={<HomePage />}></Route>
        <Route path="/register" element={<HomePage />}></Route>
        <Route path="/contact-us" element={<ContactUs/>}></Route>

        <Route path="/" element={<HomePage />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route
          path="/:lavelOne/:lavelTwo/:lavelThree"
          element={<Product />}
        ></Route>
        <Route
          path="/products"
          element={<AllProducts />}
        ></Route>
        <Route path="/product/:productId" element={<ProductDetails />}></Route>
        <Route path="/checkout" element={<CheckOut />}></Route>
        <Route path="/account/order" element={<Order />}></Route>
        <Route path="/account/profile/:userId" element={<ProfilePage />} />
        <Route
          path="/account/order/:orderId"
          element={<OrderDetails />}
        ></Route>
        <Route path="/rate-review/:productId" element={<RatingsReviewsPage />}></Route>
        <Route path="/PaymentSuccessPage" element={<SuccessPage />} />
        <Route path="/PaymentCancelPage" element={<PaymentCancelPage />} />

      </Routes>
      
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default CustomerRouters;
