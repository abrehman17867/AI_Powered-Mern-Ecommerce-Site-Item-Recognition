import React from "react";
import { Route, Routes } from "react-router-dom";
import CustomerLayout from "../components/layout/CustomerLayout";
import AccountLayout from "../components/layout/AccountLayout";
import AuthPageLayout from "../components/layout/AuthPageLayout";
import HomePage from "../customer/pages/HomePage/HomePage";
import LoginPage from "../customer/pages/Auth/LoginPage";
import RegisterPage from "../customer/pages/Auth/RegisterPage";
import Cart from "../customer/components/Cart/Cart";
import Product from "../customer/components/Product/Product";
import ProductDetails from "../customer/components/ProductDetails/ProductDetails";
import CheckOut from "../customer/components/CheckOut/CheckOut";
import Order from "../customer/components/Order/Order";
import OrderDetails from "../customer/components/Order/OrderDetails";
import ProfilePage from "../customer/pages/Account/ProfilePage";
import RatingsReviewsPage from "../customer/pages/Ratings and Reviews/RatingsReviewsPage";
import AllProducts from "../customer/components/Product/AllProducts";
import SuccessPage from "../customer/pages/PaymentPages/PaymentSuccessPage";
import PaymentCancelPage from "../customer/pages/PaymentPages/PaymentCancelPage";
import ContactUs from "../customer/pages/AboutPage/ContactUs";
import ProtectedRoute from "../customer/components/navigation/ProtectedRoute";

const CustomerRouters = () => {
  return (
    <Routes>
      <Route element={<AuthPageLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AccountLayout />}>
        <Route path="/account/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
        <Route path="/account/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/account/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/:lavelOne/:lavelTwo/:lavelThree" element={<Product />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckOut /></ProtectedRoute>} />
        <Route path="/rate-review/:productId" element={<RatingsReviewsPage />} />
        <Route path="/PaymentSuccessPage" element={<SuccessPage />} />
        <Route path="/PaymentCancelPage" element={<PaymentCancelPage />} />
      </Route>
    </Routes>
  );
};

export default CustomerRouters;
