# Google Search Console for vishalk.com

**Why:** Search Console is how you see **what Google indexed** and **which queries** showed the site. Google Analytics does not answer that.

**You need:** A Google account. Ability to add a **TXT** record on the `vishalk.com` zone in Cloudflare (Domain property).

Official sources:

- [Add a website property](https://support.google.com/webmasters/answer/34592)
- [Verify site ownership](https://support.google.com/webmasters/answer/9008080)
- [Sitemaps report](https://support.google.com/webmasters/answer/7451001)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [URL Inspection tool](https://support.google.com/webmasters/answer/9012289)
- [Page indexing report](https://support.google.com/webmasters/answer/7440203)
- [Site names](https://developers.google.com/search/docs/appearance/site-names) (generic names, `alternateName`, www vs apex)

Open: [https://search.google.com/search-console](https://search.google.com/search-console)

## Step 1 — Add a Domain property `vishalk.com`

**Do:** Property selector → **+ Add property**. Choose **Domain** and enter `vishalk.com` (no `https://`, no `www`).

**Why Domain, not URL-prefix:** A Domain property includes http/https and www/non-www in one place ([property types](https://support.google.com/webmasters/answer/34592)). You still want the Cloudflare 301 so Google’s canonical is the apex; Domain just means you do not miss www leftovers.

**Done when:** Search Console shows the verification screen and asks for a **DNS** record. Domain properties **only** verify via DNS ([verification methods](https://support.google.com/webmasters/answer/9008080)).

## Step 2 — Verify with a DNS TXT record (Cloudflare)

**Do:** Follow Search Console’s TXT instructions ([DNS record section](https://support.google.com/webmasters/answer/9008080)):

1. In the verification popup, choose **TXT**.
2. Copy the value (looks like `google-site-verification=…`).
3. Cloudflare → **DNS** → **Records** → **Add record** ([create DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)):
   - Type: **TXT**
   - Name: `@` (zone apex)
   - **Content:** the **exact** Search Console string (`google-site-verification=…`). Google Help calls this Value; Cloudflare’s field is Content.
   - Do not look for a proxy toggle on TXT.
4. Wait until the record is public. Check with [Google Admin Toolbox Dig](https://toolbox.googleapps.com/apps/dig/) → `vishalk.com` → **TXT** ([Google’s own check](https://support.google.com/webmasters/answer/9008080)). If Search Console lists the wrong registrar, choose **Any DNS provider**.
5. Back in Search Console, click **Verify**.

If verification fails immediately, wait (Google says it can take **up to two or three days** for a new DNS record) and try again. **Leave the TXT record in place** after success or you will lose ownership.

**Done when:** The property opens and is verified. Keep the TXT record forever.

## Step 3 — Submit `https://vishalk.com/sitemap.xml`

The file is already on the site and listed in `robots.txt`. Google can discover it that way, but the **Sitemaps report only lists sitemaps you submit** in Search Console or via the API ([Sitemaps report](https://support.google.com/webmasters/answer/7451001)). Submit so you can see **Success** vs **Couldn’t fetch**.

**Do:**

1. Confirm the sitemap is fetchable: `curl.exe -sS -o NUL -w "%{http_code} %{content_type}\n" https://vishalk.com/sitemap.xml` → **200** and `application/xml`.
2. Search Console → **Sitemaps**.
3. Paste `https://vishalk.com/sitemap.xml` (or `sitemap.xml` if the box already has the origin) → **Submit** ([steps](https://support.google.com/webmasters/answer/7451001)).

Submitting is a **hint**, not a guarantee Google will crawl every URL ([Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).

**Done when:** The Sitemaps report row is **Success** (may take a while). If it is **Couldn’t fetch**, open the row and fix what it names.

## Step 4 — URL Inspection + request indexing

Inspect at least:

- `https://vishalk.com/`
- `https://vishalk.com/work`
- `https://vishalk.com/contact`
- `https://vishalk.com/about`
- `https://vishalk.com/resume`

**Do** ([URL Inspection](https://support.google.com/webmasters/answer/9012289)):

1. Paste the URL into the inspection bar at the top.
2. Read whether it is **on Google**.
3. **Test live URL**. Crawl allowed / Page fetch should succeed; indexing allowed should be yes.
4. If the live test is clean, **Request indexing**. Daily request limits apply; the sitemap covers the rest.

**Done when:** Live test is successful for those URLs. Indexed vs “discovered, not indexed” can lag **days to weeks**. Re-inspect later; do not hammer Request indexing.

## Step 5 — Page indexing vs “I only see home”

**Do:** Search Console → **Indexing** → **Pages** ([Page indexing report](https://support.google.com/webmasters/answer/7440203)).

- **Not indexed** with a reason (duplicate, crawled – currently not indexed, etc.) is the real diagnosis.
- This report is **not** Google Analytics. A visitor who never loads `/work` will never create a GA row for `/work`, even if `/work` is indexed.

**Done when:** You can name how many URLs are indexed and open one “not indexed” reason if the count is only `/`.

## Step 6 — How they found you on Google (queries + pages)

This is the only place that shows **the search terms**. Analytics only sees “google / organic,” not the query.

**Do:** Search Console → **Performance** → **Search results**.

- **Queries** tab: what they typed. Filter for `vishalk.com`, `vishalk`, `vishal kumar frontend`, `vishal kumar punjab`.
- **Pages** tab: which URLs got the impressions and clicks (`/`, `/work`, `/contact`, …).

To see the same data next to GA behavior, link the two products ([steps in the GA4 guide](./google-analytics-4.md#step-7--google-search-queries-link-search-console)).

A query that is exactly **vishal kumar** will usually be other people. That is expected for a common name ([Google: avoid generic site names](https://developers.google.com/search/docs/appearance/site-names)). Success is impressions for **disambiguating** queries and for `vishalk.com`, not winning the generic name.

**Done when:** You have looked at Queries at least once after data exists (often a few days after verification). Empty is normal on day one.

## Failures to check

| Symptom | Likely cause |
| --- | --- |
| DNS verify fails | TXT not at apex, wrong string, or not propagated yet |
| Sitemap Couldn’t fetch | File 5xx, wrong property (http vs https), or blocked to Googlebot |
| Only `/` indexed | New shells not crawled yet; request indexing + wait; confirm `/work` is 200 without `noindex` |
| www still in the index | Finish the [www 301 guide](./cloudflare-www-to-apex.md) then re-inspect www |
| Sitemaps report empty | File is only in robots.txt — submit `https://vishalk.com/sitemap.xml` in this property (apex URL, not www) |
