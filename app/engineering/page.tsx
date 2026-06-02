'use client';

export default function EngineeringPage() {
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--blue)', marginBottom: 16 }}>Engineering</h1>
      <p style={{ fontSize: 20, color: 'var(--label-secondary)', maxWidth: 600 }}>
        This module is currently under development. Stay tuned for exciting engineering tools and resources!
      </p>
      
      <div style={{ marginTop: 40, padding: '20px 40px', background: 'var(--bg-tertiary)', borderRadius: 100, border: '1px solid var(--separator)' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--label-primary)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}
