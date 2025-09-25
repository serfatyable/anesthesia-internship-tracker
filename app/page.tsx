export default function Home() {
  return (
    <main className="p-6">
      <h1>Welcome</h1>
      <p>Debug mode (no redirects).</p>
      <nav className="space-x-4 underline">
        <a href="/login">Login</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/health">Health</a>
        <a href="/debug/status">Status</a>
      </nav>
    </main>
  );
}
