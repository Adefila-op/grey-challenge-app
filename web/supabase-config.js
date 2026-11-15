window.__GREY_SUPABASE__ = {
  url: "https://nvqbucngwaalfezdncsx.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cWJ1Y25nd2FhbGZlemRuY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NDQ3ODcsImV4cCI6MjExMDIyMDc4N30.DC7H7W1ODVyCV_CQ7Pfn0bsmLkEJmYErIZc2HnpS5w4",
  publishableKey: "sb_publishable_KVBUxRuqSafAJWqn19dSow_hmfmtXJp"
};

if (!window.SUPABASE_URL) {
  window.SUPABASE_URL = window.__GREY_SUPABASE__.url;
}

if (!window.SUPABASE_ANON_KEY) {
  window.SUPABASE_ANON_KEY = window.__GREY_SUPABASE__.anonKey;
}

if (!window.SUPABASE_PUBLISHABLE_KEY) {
  window.SUPABASE_PUBLISHABLE_KEY = window.__GREY_SUPABASE__.publishableKey;
}

// Keep service-role secrets, database passwords, and JWT secrets on the server.
// The browser only needs the project URL and the anon key for sign-in and profile sync.
