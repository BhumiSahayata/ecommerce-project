export default function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent"
          style={{
            borderColor: 'var(--border-default)',
            borderTopColor: 'var(--brand)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
}