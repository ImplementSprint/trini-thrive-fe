import Link from 'next/link';

const portals = [
  {
    id: 'citizen',
    title: 'Affected Citizen',
    subtitle: 'Public portal',
    href: '/citizen/login',
    color: '#1b6e2e',
    icon: 'person',
  },
  {
    id: 'site-manager',
    title: 'Site Manager',
    subtitle: 'Operations portal',
    href: '/site-manager/login',
    color: '#7e5700',
    icon: 'warehouse',
  },
  {
    id: 'dispatcher',
    title: 'Dispatcher',
    subtitle: 'Command portal',
    href: '/dispatcher/login',
    color: '#1d622b',
    icon: 'radio',
  },
  {
    id: 'admin',
    title: 'Administrator',
    subtitle: 'System portal',
    href: '/admin/login',
    color: '#0d631b',
    icon: 'admin_panel_settings',
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Public Sans', sans-serif",
        background: 'var(--bg)',
      }}
    >
      {/* Brand panel */}
      <div
        style={{
          width: '420px',
          background: 'var(--primary)',
          color: '#fff',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            DAMAYAN
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.25rem' }}>
            Disaster Relief & Response Platform
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.7 }}>
            Integrated platform with 4 portals — real-time sync, offline
            capability, and role-based access for every stage of disaster
            response.
          </p>
        </div>
      </div>

      {/* Portal selector */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          gap: '1rem',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Choose your portal
        </h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '560px',
          }}
        >
          {portals.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1.5rem',
                borderRadius: '12px',
                background: 'var(--surface)',
                border: `2px solid ${p.color}22`,
                textDecoration: 'none',
                color: 'var(--text)',
                transition: 'box-shadow 0.15s',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: p.color, fontSize: '2rem' }}
              >
                {p.icon}
              </span>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.title}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
