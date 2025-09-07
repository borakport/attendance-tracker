export default function DiagnosticPage() {
  console.log('Diagnostic page is rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>✅ Diagnostic Page Working!</h1>
      <p>If you can see this, Next.js is working correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</p>
    </div>
  );
}
