import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [dbMessage, setDbMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Test API health
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      setMessage(healthData.message);

      // Get database message
      const dbResponse = await fetch('/api/message');
      const dbData = await dbResponse.json();
      setDbMessage(dbData.message);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to the server');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 TaskFlow DevOps Project</h1>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="content">
            <div className="card">
              <h2>✅ WebApp Status</h2>
              <p>{message}</p>
            </div>
            
            <div className="card">
              <h2>🗄️ Database Status</h2>
              <p>{dbMessage}</p>
            </div>

            <div className="info">
              <h3>📊 Architecture Info</h3>
              <ul>
                <li>Frontend: React + Vite</li>
                <li>Backend: Node.js + Express</li>
                <li>Database: PostgreSQL (Private EC2)</li>
                <li>Infrastructure: AWS CloudFormation</li>
                <li>CI/CD: GitHub Actions</li>
              </ul>
            </div>
          </div>
        )}
        
        <button onClick={fetchData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </header>
    </div>
  );
}

export default App;
