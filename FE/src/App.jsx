import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import endPoints from "./routers/router";
import Login from '@pages/login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={endPoints.LOGIN} element={<Login />} />
        {/* <Route path={endPoints.REGISTER} element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
