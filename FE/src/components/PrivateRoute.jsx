import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import endPoints from "../routers/router";

const PrivateRoute = ({ allowedRoles }) => {
  let { accessToken, role, redirectPath } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();

  if(redirectPath != "Admin" || redirectPath != "Staff"){
    redirectPath = endPoints.FORBIDDEN;
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={redirectPath || "/forbidden"} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
