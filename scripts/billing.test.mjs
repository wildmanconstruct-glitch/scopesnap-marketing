import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

// Run the real billing-page script with network and DOM boundaries stubbed.
// No production account, payment or email is used.
const html = await readFile(new URL('../billing.html', import.meta.url), 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
async function page() {
  const nodes = new Map();
  function element(id) {
    if (!nodes.has(id)) nodes.set(id, {
      style: {}, handlers: {}, value: '', textContent: '', disabled: false,
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      getAttribute(name) { return name === 'data-plan' ? 'solo' : null; },
    });
    return nodes.get(id);
  }
  let authChanged;
  const requests = [];
  const auth = {
    onAuthStateChange(fn) { authChanged = fn; },
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => { throw new Error('Network unavailable'); },
  };
  vm.runInNewContext(source, {
    document: {
      getElementById: element,
      querySelectorAll: selector => selector === '#stateChoose .price-btn[data-plan]' ? [element('checkout')] : [],
    },
    window: { supabase: { createClient: () => ({ auth }) }, location: { search: '', pathname: '/billing', href: '' } },
    URL, URLSearchParams, setTimeout,
    fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ url: 'https://checkout.stripe.com/test' }) }; },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { element, authChanged, requests };
}

test('checkout uses the refreshed token on a long-open page', async () => {
  const { element, authChanged, requests } = await page();
  authChanged('SIGNED_IN', { access_token: 'old-token' });
  authChanged('TOKEN_REFRESHED', { access_token: 'fresh-token' });
  await element('checkout').handlers.click();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers.Authorization, 'Bearer fresh-token');
});

test('a thrown login request restores the button and explains the failure', async () => {
  const { element, requests } = await page();
  element('lEmail').value = 'test@example.com'; element('lPassword').value = 'example';
  await element('loginForm').handlers.submit({ preventDefault() {} });
  assert.equal(element('loginBtn').disabled, false);
  assert.equal(element('loginBtnText').textContent, 'Sign in');
  assert.match(element('loginError').textContent, /Check your connection/);
  assert.equal(requests.length, 0);
});
