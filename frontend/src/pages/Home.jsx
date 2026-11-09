import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/services");

        const data = response.data.services || response.data;

        setServices(data);

      } catch (err) {
        setError("Unable to load services. Please try again.");
        console.error(err);
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
      setLoading(true);
      setError("");
      setToken(null);

      const response = await api.post("/tokens", {
        service_id: selectedService
      });

      if (response.data.success) {
        setToken(response.data.token);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Token generation failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">

      <nav className="navbar">
        <h2>QueueEase</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <h1>Smart Queue Management</h1>

          <p>
            Book your token online and track your
            queue in real time.
          </p>

          <a href="#generate" className="primary-btn">
            Get Your Token
          </a>
        </div>
      </section>

      <section className="features">

        <div className="feature-card">
          <h3>Digital Tokens</h3>
          <p>Generate tokens without standing in queues.</p>
        </div>

        <div className="feature-card">
          <h3>Live Tracking</h3>
          <p>Track your queue position in real time.</p>
        </div>

        <div className="feature-card">
          <h3>Save Time</h3>
          <p>Manage your visits more efficiently.</p>
        </div>

      </section>

      <section className="token-section" id="generate">

        <h2>Generate Your Token</h2>

        <p>Select a service to book your queue token.</p>

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Select a Service</option>

          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.service_name}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateToken}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? "Generating..." : "Generate Token"}
        </button>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {token && (
          <div className="token-result">

            <h2>Token Generated Successfully!</h2>

            <h1>{token.token_number}</h1>

            <p>
              Service: {
                services.find(
                  s => String(s.id) === String(token.service_id)
                )?.service_name
              }
            </p>

            <p>Status: {token.status}</p>

            <p>
              Estimated Waiting Time:{" "}
              {token.estimated_wait_minutes} minutes
            </p>

            <p>Token ID: {token.id}</p>

          </div>
        )}

      </section>

      <footer>
        <p>© 2026 QueueEase. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default Home;