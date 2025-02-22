import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import endPoints from "./routers/router";
import Login from "@pages/login";
import PrivateRoute from "@components/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import ForbiddenPage from '@components/ForbiddenPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={["Admin", "Staff"]} />}>
          <Route path={endPoints.ADMIN} element={<AdminLayout />}></Route>
        </Route>
        <Route path="/" element={<Navigate to={endPoints.LOGIN} />} />
        <Route path={endPoints.LOGIN} index element={<Login />} />
        {/* <Route path={endPoints.REGISTER} element={<Register />} /> */}
        <Route path={endPoints.FORBIDDEN} element={<ForbiddenPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
