import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser, registerUser } from "../auth.ts";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log(" BOTÓN LOGIN FUNCIONA")
  
    try {
      const result = await loginUser(email, password);
      console.log("LOGIN OK:", result.user);
  
      navigate({ to: "/" });
    } catch (e: any) {
      console.log(" ERROR COMPLETO:", e);
      alert(e.message);
    }
  };

  const handleRegister = async () => {
    console.log(" REGISTER CLICKED");
  
    try {
      const result = await registerUser(email, password);
  
      console.log(" REGISTER OK");
      console.log(result);
  
      alert("Usuario creado");
  
      navigate({ to: "/" });
    } catch (e: any) {
      console.log(" REGISTER ERROR:", e.code, e.message);
      alert(e.message);
    }
  };


  return (
    <div style={{ padding: 20, maxWidth: 320, margin: "0 auto" }}>
      <h1>Apex Athlete Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleLogin} style={{ width: "100%", marginBottom: 10 }}>
        Login
      </button>

      <button onClick={handleRegister} style={{ width: "100%" }}>
        Register
      </button>
    </div>
  );
}