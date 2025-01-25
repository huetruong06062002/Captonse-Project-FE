import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "@redux/features/authReducer/authSlice";
import endPoints from "@routers/router";

const LogoutAndRedirect = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  return <Navigate to={endPoints.LOGIN} replace />;
};

export default LogoutAndRedirect; 
