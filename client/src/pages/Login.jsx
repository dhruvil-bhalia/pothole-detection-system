import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const data = await login({
        email,
        password,
      });

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "role",
        data.role
      );

      localStorage.setItem(
        "name",
        data.name
      );

      if (rememberMe) {

        localStorage.setItem(
          "remember",
          "true"
        );

      }

      setTimeout(() => {

        setLoading(false);

        navigate("/dashboard");

      }, 1200);

    }

    catch (error) {

      setLoading(false);

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }

  };

  return (

<div className="login-page">

<div className="login-card">

{/* LEFT */}

<div className="login-left">

<h1>
🚧
</h1>

<h2>
Pothole Detection
System
</h2>

<h4>
AI Powered Smart Road Monitoring
</h4>

<p>

Monitor road damage in real-time using

Artificial Intelligence,

Computer Vision,

MERN Stack,

Socket.IO,

GPS Tracking

and

YOLOv8.

</p>

<div className="tech-stack">

<span>MERN </span>

<span>YOLOv8 </span>

<span>Socket.IO </span>

<span>MongoDB </span>

<span>React </span>

<span>AI </span>

</div>

</div>

{/* RIGHT */}

<div className="login-right">

<h2 className="login-title">

Welcome Back 👋

</h2>

<p className="login-subtitle">

Login to continue

</p>

<form onSubmit={handleLogin}>

<div className="input-group-custom">

<label>

Email Address

</label>

<input

type="email"

placeholder="admin@gmail.com"

value={email}

onChange={(e)=>

setEmail(e.target.value)

}

required

/>

</div>

<div className="input-group-custom">

<label>

Password

</label>

<div className="password-box">

<input

type={
showPassword
? "text"
: "password"
}

placeholder="••••••••"

value={password}

onChange={(e)=>

setPassword(e.target.value)

}

required

/>

<button

type="button"

className="eye-btn"

onClick={()=>

setShowPassword(

!showPassword

)

}

>

{showPassword

?

"🙈"

:

"👁"}

</button>

</div>

</div>

<div className="remember-row">

<label>

<input

type="checkbox"

checked={rememberMe}

onChange={(e)=>

setRememberMe(

e.target.checked

)

}

/>

Remember Me

</label>

<span>

Forgot Password?

</span>

</div>

<button

className="login-btn"

disabled={loading}

>

{

loading

?

<div className="spinner">

</div>

:

"Login"

}

</button>

</form>

<div className="footer-text">

© 2026

Pothole Detection System

<br/>

Built using

React • Node • MongoDB • Flask • YOLO

</div>

</div>

</div>

</div>

  );

}

export default Login;