import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const RemoveTrailingSlash = () => {
  const currentLocation = useLocation();
  const { pathname } = currentLocation;

  if (pathname === "/albums/") {
    return (
      <Navigate
        to={{
          pathname: "/albums",
        }}
      />
    );
  } else return null;
};
