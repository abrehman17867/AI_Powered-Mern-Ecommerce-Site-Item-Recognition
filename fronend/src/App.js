import "./App.css";
import { Route, Routes } from "react-router-dom";
import CustomerRouters from "./Router/CustomerRouters.jsx";
import AdminRouters from "./Router/AdminRouters.jsx";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/*" element={<CustomerRouters />}></Route>
        <Route path="/admin/*" element={<AdminRouters />}></Route>
      </Routes>
    </div>
  );
}

export default App;
