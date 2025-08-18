import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function CardsRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
}