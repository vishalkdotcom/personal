# 301 `www.vishalk.com` to `https://vishalk.com`

**Why:** On 2026-08-25, `https://www.vishalk.com/` returned **200** (same HTML as apex, canonical already `https://vishalk.com/`). That is a duplicate origin. A single-hop **301** makes the apex the only URL browsers and crawlers keep.

**You need:** Cloudflare zone `vishalk.com`. Do **not** use Page Rules (deprecated) or a Pages `_redirects` file (domain-level redirects are unsupported there; default status is 302).

While `www` is still a Pages custom domain, the agent gateway (`handleAgentRequest`) 301s GET/HEAD `www.vishalk.com` to `https://vishalk.com` and 308s other methods. That hop is enough for crawlers after the next production deploy. Keep the zone Single Redirect below as the durable rule after you detach www from Pages (Step 4).

Official sources:

- [Which redirect product](https://developers.cloudflare.com/fundamentals/reference/redirects/) — Single Redirects are the default
- [Create a redirect rule](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/)
- [Single Redirects settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/) — **301**, preserve query string (off by default)
- [Redirect to a different hostname](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-different-hostname/) — `http*` + `${2}` pattern
- [WWW to root gallery example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/) — HTTPS-only; leaves HTTP www unchanged
- [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages: www to apex](https://developers.cloudflare.com/pages/how-to/www-redirect/) — dummy A `192.0.2.1` after cutover
- [Page Rules deprecated](https://developers.cloudflare.com/rules/page-rules/)

## Step 1 — Confirm www is proxied (do not detach yet)

**Do:**

1. **Workers & Pages** → this project → **Custom domains**. Both `vishalk.com` and `www.vishalk.com` should be listed.
2. **DNS** → `www` is **Proxied** (orange cloud). Single Redirects only see proxied hostnames.
3. Snapshot before you change anything:

```text
curl.exe -sI https://www.vishalk.com/
curl.exe -sI https://www.vishalk.com/contact
curl.exe -sI https://vishalk.com/
```

**Done when:** www is proxied and currently **200**. Apex is **200**. Keep the existing `www` CNAME until the rule is proven — do not gray-cloud or delete `www` first.

## Step 2 — Single Redirect (one hop, HTTP and HTTPS)

Cloudflare’s gallery `https://www.*` → `https://${1}` **does not match HTTP**. Combined with Always Use HTTPS that becomes two hops (`http://www` → `https://www` → apex).

Use the hostname-specific wildcard instead ([different hostname example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-different-hostname/)):

| Field | Value |
| --- | --- |
| When incoming requests match | Wildcard pattern |
| Request URL | `http*://www.vishalk.com/*` |
| Target URL | `https://vishalk.com/${2}` |
| Status code | **301** |
| Preserve query string | **Enabled** |

`${2}` is the path after `www.vishalk.com/`. Do **not** use a static target of `https://vishalk.com/` — that drops `/contact`.

**Do:** Zone **Rules** → **Redirect Rule** → deploy the table above. Apex must **not** be in the match.

**Done when:** the rule is enabled and only matches `www.vishalk.com`.

## Step 3 — Test (HEAD, do not follow redirects)

```text
curl.exe -sI https://www.vishalk.com/
curl.exe -sI https://www.vishalk.com/contact
curl.exe -sI "https://www.vishalk.com/contact?ref=test"
curl.exe -sI http://www.vishalk.com/contact
curl.exe -sI https://vishalk.com/
curl.exe -sI https://vishalk.com/contact
```

| Request | Status | `Location` |
| --- | --- | --- |
| `https://www.vishalk.com/` | 301 | `https://vishalk.com/` (path not dropped) |
| `https://www.vishalk.com/contact` | 301 | `https://vishalk.com/contact` |
| `…/contact?ref=test` | 301 | query still present |
| `http://www.vishalk.com/contact` | 301 | `https://vishalk.com/contact` (not `https://www…`) |
| apex URLs | **200** | no redirect |

A second `curl.exe -sI` on each `Location` must be **200** on apex — one hop, no `pages.dev` in the chain.

**Done when:** that table holds.

## Step 4 — After it works: www is redirect-only

Pages warns against flipping DNS on and off. Once Step 3 passes:

1. Replace the `www` **CNAME** with a **proxied A** to `192.0.2.1` ([Pages www how-to](https://developers.cloudflare.com/pages/how-to/www-redirect/)). Traffic still hits Cloudflare; the rule still 301s.
2. Remove `www.vishalk.com` from the Pages project **Custom domains** so www is not a second origin if the rule is ever disabled.

Leave **apex** DNS and the apex custom domain alone.

**Done when:** www is not an active Pages custom domain; apex still is; curls from Step 3 still pass.

## What not to do

- Page Rules Forwarding URL, `_redirects`, or **302**
- `www` → `*.pages.dev` → apex
- Gray-cloud `www` (the rule never runs)
- CNAME `www` to Pages **without** it being a Custom domain (522) — after cutover you do not want www as a Pages hostname anyway
- Redirecting apex to www
