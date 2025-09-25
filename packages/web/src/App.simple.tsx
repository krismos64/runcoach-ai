function App() {
  console.log('App simple chargée');
  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#0f0f0f',
      color: '#00ff00',
      minHeight: '100vh',
      fontFamily: 'monospace',
      fontSize: '18px'
    }}>
      <h1>🚀 TEST ULTRA-SIMPLE</h1>
      <p>Si vous voyez ce message, React fonctionne !</p>
      <button
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#00ff00',
          color: '#000',
          border: 'none',
          borderRadius: '5px'
        }}
        onClick={() => alert('Click OK !')}
      >
        Test Click
      </button>
    </div>
  );
}

export default App;