import "./App.css";
import { Route, Routes } from "react-router-dom";
import CustomerRouters from "./Router/CustomerRouters.jsx";
import AdminRouters from "./Router/AdminRouters.jsx";
import AppToast from "./components/AppToast";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/*" element={<CustomerRouters />}></Route>
        <Route path="/admin/*" element={<AdminRouters />}></Route>
      </Routes>
      <AppToast />
    </div>
  );
}

export default App;
