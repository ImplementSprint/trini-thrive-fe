export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>HOPECARD</h1>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
        <a href="/admin/login" style={{ padding: '0.5rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Admin Portal</a>
        <a href="/donor" style={{ padding: '0.5rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Digital Donor</a>
        <a href="/campaign-manager/login" style={{ padding: '0.5rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Campaign Manager</a>
        <a href="/beneficiary/login" style={{ padding: '0.5rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>Beneficiary</a>
      </nav>
    </main>
  );
}
