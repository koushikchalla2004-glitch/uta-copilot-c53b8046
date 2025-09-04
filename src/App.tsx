import React from "react";

const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c2d92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          UTA Copilot
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Your intelligent campus companion
        </p>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7)',
          borderRadius: '50%',
          margin: '40px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold'
        }}>
          UC
        </div>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>
          Ready to explore campus!
        </p>
      </div>
    </div>
  );
};

export default App;