import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pages = ["privacy", "terms", "delete-account"];
const routes = [...pages, "contact"];
const nav = `<nav id="nav"><div class="wrap nav-inner"><span class="logo-name">ScopeSnap</span><span style="color:var(--muted);font-size:13px;">Help and legal</span></div></nav>`;
const footer = `<footer><div class="wrap footer-bottom"><span>ScopeSnap Pty Ltd · ABN 84 698 607 868</span><nav aria-label="Help and legal" style="display:flex;flex-wrap:wrap;gap:16px;">
  <a href="/app/privacy">Privacy</a><a href="/app/terms">Terms</a><a href="/app/delete-account">Account deletion</a><a href="/app/contact">Support</a>
</nav></div></footer>`;

// The native pages use the public policy bodies on every deployment, keeping
// legal text in one place while avoiding marketing/purchase navigation.
function appPage(source, slug) {
  let html = source.replace(/<nav id="nav">[\s\S]*?<\/nav>/, nav)
    .replace(/<footer>[\s\S]*?<\/footer>/, footer)
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace(/<meta name="robots"[^>]*>/g, "")
    .replace("</head>", `<meta name="robots" content="noindex"/><link rel="canonical" href="https://scopesnap.com.au/${slug}"/><style>footer a{color:var(--muted);font-size:13px;display:inline-flex;align-items:center;min-height:44px;} .inner-content a{overflow-wrap:anywhere;}</style></head>`)
    .replace(/href="([^"#]+)(#[^"]*)?"/g, (match, href, hash = "") => {
      const url = new URL(href, "https://scopesnap.com.au");
      if (!["scopesnap.com.au", "www.scopesnap.com.au"].includes(url.hostname)) return match;
      const route = url.pathname.replace(/^\/app\//, "/").replace(/\.html$/, "").replace(/\/$/, "").slice(1);
      return routes.includes(route) ? `href="/app/${route}${hash}"` : match;
    });
  // Fail the build if a future policy edit adds a ScopeSnap purchase route.
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(href.replace(/&amp;/g, "&"), "https://scopesnap.com.au");
    if (url.hostname === "app.scopesnap.com.au" ||
        (["scopesnap.com.au", "www.scopesnap.com.au"].includes(url.hostname) &&
         !routes.some(route => url.pathname === `/app/${route}`))) {
      throw new Error(`Unexpected ScopeSnap navigation in ${slug}: ${href}`);
    }
  }
  return html;
}

await mkdir(path.join(root, "app"), { recursive: true });
for (const slug of pages) {
  const source = await readFile(path.join(root, `${slug}.html`), "utf8");
  await writeFile(path.join(root, "app", `${slug}.html`), appPage(source, slug));
}
const privacy = await readFile(path.join(root, "privacy.html"), "utf8");
const support = privacy.replace(/<title>[^<]+<\/title>/, "<title>Support — ScopeSnap</title>")
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Get help with your ScopeSnap account, app or data."/>')
  .replace(/<main>[\s\S]*?<\/main>/, `<main>
    <section class="inner-hero"><div class="wrap"><div class="eyebrow">Help</div><h1>ScopeSnap Support</h1></div></section>
    <section class="section" style="padding-top:0;"><div class="wrap"><div class="inner-content">
      <h2>How can we help?</h2>
      <p>For app problems or help with your existing account, email <a href="mailto:hello@scopesnap.com.au">hello@scopesnap.com.au</a>.</p>
      <p>Include your account email, company name, device model and a description of the issue. Never send passwords or full payment card details.</p>
      <h2>Account and payment issues</h2>
      <p>Contact us for help with account access, an existing payment, cancellation or a refund request. Tell us which account your request concerns.</p>
      <h2>Privacy and deletion</h2>
      <p>You can <a href="/delete-account">request account deletion</a> without signing in or reinstalling the app. For access to or correction of personal information, contact the same email address.</p>
      <p>Read our <a href="/privacy.html">Privacy Policy</a> and <a href="/terms.html">Terms</a>.</p>
    </div></div></section>
  </main>`);
await writeFile(path.join(root, "app", "contact.html"), appPage(support, "contact"));
console.log("Built four app help/legal pages from the current policies.");
