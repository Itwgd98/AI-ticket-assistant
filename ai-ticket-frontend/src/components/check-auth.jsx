import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CheckAuth({ children, protected: isProtected }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (isProtected) {
      // Protected route → requires token
      if (!token) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    } else {
      // Public route → redirect if already logged in
      if (token) {
        navigate("/");
      } else {
        setLoading(false);
      }
    }
  }, [navigate, isProtected]);

  if (loading) return <div>Loading...</div>;
  return children;
}
