
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";

import "./App.css";
import api from "./services/api";

// ==============================
// NAVBAR
// ==============================

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        QueueEase
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

// ==============================
// HOME PAGE
// ==============================

function Home() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [token, setToken] = useState(null);

  const [loadingServices, setLoadingServices] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        setError("");

        const response = await api.get("/services");

        if (response.data.success) {
          setServices(response.data.services || []);
        } else {
          setError("Unable to load services.");
        }

      } catch (err) {
        console.error("Services error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load services. Please check the backend."
        );

      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Generate token
  const handleGenerateToken = async () => {
    if (!selectedService) {
      setError("Please select a service first.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setToken(null);

      const response = await api.post("/tokens", {
        service_id: Number(selectedService)
      });

      if (response.data.success) {
        setToken(response.data.token);
      } else {
        setError("Token generation failed.");
      }

    } catch (err) {
      console.error("Token error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to generate token."
      );

    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="home-page">

      <Navbar />

      {/* HERO SECTION */}

      <section className="hero">

        <div className="hero-content">

          <span className="hero-tag">
            SMART QUEUE MANAGEMENT SYSTEM
          </span>

          <h1>
            Skip the Line.
            <br />
            <span>Save Your Time.</span>
          </h1>

          <p>
            Book your token online and track your queue
            in real time. Enjoy a faster and smarter
            service experience.
          </p>

          <a href="#generate" className="primary-btn">
            Get Your Token →
          </a>

        </div>

        <div className="hero-card">

          <div className="hero-icon">🎫</div>

          <h3>Digital Queue</h3>

          <p>
            Your time matters. Join the queue
            from anywhere.
          </p>

          <div className="live-status">
            <span></span>
            Smart Queue System
          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="features-section">

        <div className="section-heading">
          <h2>Why Choose QueueEase?</h2>
          <p>
            Everything you need for a smarter queue experience.
          </p>
        </div>

        <div className="features">

          <div className="feature-card">
            <div className="feature-icon">🎟️</div>
            <h3>Digital Tokens</h3>
            <p>
              Generate tokens without standing in queues.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Live Tracking</h3>
            <p>
              Track your queue position in real time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Save Time</h3>
            <p>
              Manage your visits more efficiently.
            </p>
          </div>

        </div>

      </section>

      {/* TOKEN GENERATION */}

      <section className="token-section" id="generate">

        <div className="token-container">

          <span className="hero-tag">
            QUICK BOOKING
          </span>

          <h2>Generate Your Token</h2>

          <p>
            Select a service to book your queue token.
          </p>

          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setError("");
            }}
            disabled={loadingServices || generating}
          >

            <option value="">
              {loadingServices
                ? "Loading services..."
                : "Select a Service"}
            </option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.service_name}
              </option>
            ))}

          </select>

          <button
            className="primary-btn"
            onClick={handleGenerateToken}
            disabled={
              generating ||
              loadingServices ||
              services.length === 0
            }
          >
            {generating
              ? "Generating Token..."
              : "Generate Token"}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* TOKEN RESULT */}

          {token && (

            <div className="token-result">

              <div className="success-icon">✓</div>

              <h2>Token Generated Successfully!</h2>

              <p>Your queue token number is:</p>

              <h1>{token.token_number}</h1>

              <div className="token-details">

                <p>
                  <strong>Service:</strong>{" "}
                  {services.find(
                    (service) =>
                      String(service.id) ===
                      String(token.service_id)
                  )?.service_name}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {token.status}
                </p>

                <p>
                  <strong>Estimated Waiting Time:</strong>{" "}
                  {token.estimated_wait_minutes} minutes
                </p>

                <p>
                  <strong>Token ID:</strong>{" "}
                  {token.id}
                </p>

              </div>

            </div>

          )}

          {!loadingServices && services.length === 0 && !error && (
            <p>No services are currently available.</p>
          )}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        <h2>QueueEase</h2>

        <p>
          Making queues smarter, faster and easier.
        </p>

        <p>
          © 2026 QueueEase. All Rights Reserved.
        </p>
      </footer>

    </div>
  );
}

// ==============================
// LOGIN PAGE
// ==============================

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else {
        setError("Login response did not contain a token.");
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />

      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p>Login to your QueueEase account.</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

// ==============================
// REGISTER PAGE
// ==============================

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/register", {
        name,
        email,
        password
      });

      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />

      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        <p>Join QueueEase today.</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

// ==============================
// 404 PAGE
// ==============================

function NotFound() {
  return (
    <div className="auth-page">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Return Home</Link>
    </div>
  );
}

// ==============================
// MAIN APPLICATION
// ==============================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
