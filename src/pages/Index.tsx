import React from "react";

const Index = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
        {/* Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
          borderRadius: '50%',
          margin: '0 auto 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.3)'
        }}>
          UC
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '24px',
          background: 'linear-gradient(45deg, #60a5fa, #a855f7, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          UTA Copilot
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '40px',
          opacity: 0.9
        }}>
          Your intelligent campus companion powered by AI
        </p>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { icon: '🗺️', title: 'Smart Navigation', desc: 'Find any building or classroom' },
            { icon: '🎤', title: 'Voice Assistant', desc: 'Ask questions naturally' },
            { icon: '📱', title: 'Live Updates', desc: 'Real-time campus information' }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            fontSize: '16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%'
            }} />
            System Online - Ready to assist
          </div>
        </div>

        {/* Action */}
        <button 
          onClick={() => alert('UTA Copilot is ready! 🎉')}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Explore Campus
        </button>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '14px',
          opacity: 0.7
        }}>
          <p>🎓 University of Texas at Arlington</p>
          <p>Making campus life easier, one search at a time</p>
        </div>
      </div>
    </div>
  );
};

export default Index;