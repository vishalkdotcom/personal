# Google Analytics 4 on vishalk.com

**Why:** This site is a SolidJS **single-page app**. A click from About to Work does not load a new HTML document. If you only ever look at **landing pages**, or if history-based page views were off while the tag used the old Universal Analytics `page_path` config, you will mostly see `/`.

Production measurement ID (public, baked into the client): **`G-06C301CH3G`**.

**You need:** Editor (or above) on that GA4 property ([enhanced measurement](https://support.google.com/analytics/answer/9216061) requires Editor to change the data stream).

This is **not** Search Console. GA records **visits where the tag ran**. Search Console records **search impressions and indexing** ([GA reports overview](https://support.google.com/analytics/answer/9212670)).

Official sources:

- [Overview of reports](https://support.google.com/analytics/answer/9212670)
- [User vs Traffic acquisition](https://support.google.com/analytics/answer/14731736)
- [Landing page](https://support.google.com/analytics/answer/12931766)
- [Pages and screens](https://support.google.com/analytics/answer/12926732)
- [Connect Search Console](https://support.google.com/analytics/answer/10737381)
- [Enhanced measurement](https://support.google.com/analytics/answer/9216061)
- [Measure pageviews (gtag)](https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtag)
- [Measure single-page applications](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications?client_type=gtag)

Open: [https://analytics.google.com/](https://analytics.google.com/)

Set the **date range** (top right) before you judge anything. Realtime is “right now”; the other reports are usually hours behind.

| Question | Report | What you are looking at |
| --- | --- | --- |
| How did this visit start? | **Acquisition → Traffic acquisition** | Source of **each session** (Google, LinkedIn, typed URL, …) |
| How did they find me the first time? | **Acquisition → User acquisition** | Source of the **first** visit only |
| Which URL did they open first? | **Engagement → Landing page** | First page of the session (often `/` on this site) |
| Which URLs did they actually view? | **Engagement → Pages and screens** | Every Mode/Work Case after they arrived |
| What did they type into Google? | Search Console (or GA **Search Console** reports after linking) | Queries and clicks — **not** available from the GA tag alone |

## Step 1 — Confirm the stream, then Realtime

**Do:** **Admin** → **Data collection and modification** → **Data streams** → the **Web** stream. **Measurement ID** must be **`G-06C301CH3G`**.

Then **Reports** → **Realtime** ([Realtime](https://support.google.com/analytics/answer/9271392)). If you have **Reports → Realtime pages**, use that table for `/` vs `/work` vs `/contact` ([Realtime pages](https://support.google.com/analytics/answer/15315925)).

Open `https://vishalk.com` in a browser **without** an ad blocker (Incognito with extensions off). Click **Work**, **Resume**, **Contact**.

**Done when:** you appear as an active user and, after this code is on production, paths change with those clicks. Empty Realtime in your daily browser + a working Incognito test means the blocker is hiding **you**, not that GA is off.

## Step 2 — How people arrive (Traffic acquisition)

Use this for “came from Google vs LinkedIn vs typing the URL.” It is **session**-scoped: each visit is attributed separately ([User vs Traffic acquisition](https://support.google.com/analytics/answer/14731736)).

**Do:**

1. **Reports** → **Acquisition** → **Traffic acquisition**.
2. Change the primary dimension (leftmost column / dropdown above the table) to **Session source / medium** (or start from **Session default channel group** if that is already showing).
3. Typical rows you will see:

| Source / medium (examples) | Meaning |
| --- | --- |
| `google / organic` | Clicked a Google Search result |
| `linkedin.com / referral` (or `lnkd.in`) | Clicked a LinkedIn link |
| `github.com / referral` | Clicked a GitHub profile link |
| `(direct) / (none)` | Typed `vishalk.com`, used a bookmark, or the browser hid the referrer (common on mobile / HTTPS→HTTP leftovers / privacy browsers) |

**User acquisition** (same Acquisition folder) answers a different question: “the first time this person ever showed up, where did they come from?” Google’s example: first visit from Google, then ten later visits by typing the URL — User acquisition still credits Google for that person; Traffic acquisition credits Direct for the later sessions ([same article](https://support.google.com/analytics/answer/14731736)). For a portfolio, **Traffic acquisition** is the one to live in.

**Done when:** You can name the top two sources for the date range you picked.

## Step 3 — First page they opened (Landing page)

This is “where the session started,” not “every page they read” ([Landing page report](https://support.google.com/analytics/answer/12931766)).

**Do:**

1. **Reports** → **Engagement** → **Landing page**.
2. You will mostly see `/` because About is the homepage. Deep links (`/work/...`, `/contact`) appear when someone opens that URL directly (shared case link, Google result, resume).
3. Add a **secondary dimension**: click the **+** on the table header → **Session source / medium**. That is Google’s own recipe for “this landing page, from this source” ([customize Landing page](https://support.google.com/analytics/answer/12931766)).

The other direction: Traffic acquisition → primary **Session source / medium** → secondary **Landing page + query string**.

If **Landing page** is missing from the left nav, an Editor can add it back from **Library** ([same article](https://support.google.com/analytics/answer/12931766)).

**Done when:** You have one table that shows `/` vs `/contact` vs a Work Case path, with source/medium next to it.

## Step 4 — Pages and screens (not Landing page)

**Do** ([Pages and screens](https://support.google.com/analytics/answer/12926732)):

1. **Reports** → **Engagement** → **Pages and screens**.
2. Set the primary dimension to **Page path and screen class** (path after the domain: `/`, `/work`, `/contact`).
3. Do **not** use this report to judge “first page only.” For the **first** page of a session, Google says use the **Landing page** report instead.

Google’s own note: `/` means the home directory ([what `/` means](https://support.google.com/analytics/answer/12926732)). On this site that is About.

Realtime is minutes. **Pages and screens / Landing page / Traffic acquisition** often need **hours**, and Google documents **24–48 hours** before standard reports are complete ([data freshness](https://support.google.com/analytics/answer/11198161); [confirm collection](https://support.google.com/analytics/answer/9333790)). Do not judge last night’s clicks at 9am the next morning.

**Done when:** You can switch between **Page path and screen class**, **Page title and screen class**, and (separately) **Landing page**, and you know which one you are looking at.

## Step 5 — Turn off duplicate history page views

The site **disables** automatic `page_view` on `gtag('config')` (`send_page_view: false`) and then sends:

`gtag('event', 'page_view', { send_to, page_title, page_location })`

That matches [manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtag).

Enhanced measurement **also** sends `page_view` on History API `pushState` / `replaceState` unless you disable that advanced option ([enhanced measurement page_view](https://support.google.com/analytics/answer/9216061); [SPA doc](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications?client_type=gtag)). If both fire, every Mode click is counted twice.

**Do:**

1. **Admin** → **Data collection and modification** → **Data streams** → the **vishalk.com** web stream.
2. **Enhanced measurement** → the gear / pencil for individual events.
3. Under **Page views**, open advanced settings.
4. Leave **Page loads** on.
5. Turn **off** **Page changes based on browser history events**.

(Google’s SPA article describes the opposite choice — history ON and no manual events. This repo chose manual events so titles come from the route manifest. Only one of the two systems should send SPA views.)

**Done when:** One Mode click in Realtime produces **one** `page_view`, not two.

## Step 6 — DebugView (when Realtime is confusing)

[Monitor events in DebugView](https://support.google.com/analytics/answer/7201382). Enable debug **for you**, not for every visitor.

**Do:**

1. Chrome: [Tag Assistant](https://tagassistant.google.com) / the [Tag Assistant extension](https://support.google.com/tagmanager/answer/16463290) → connect `https://vishalk.com` so the URL gets `_dbg`.
2. Analytics **Admin** → **Data display** → **DebugView**. Pick your device.
3. Click Work / Contact / Resume. Each click should add **one** `page_view` whose `page_location` matches the address bar ([SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)). Two events per click → Step 5. Zero events on click → the SPA view never fired.
4. Do not leave `gtag('config', 'G-06C301CH3G', { debug_mode: true })` in production. Omitting `debug_mode` turns it off; setting it to `false` does **not** ([DebugView](https://support.google.com/analytics/answer/7201382)).

**Done when:** one `page_view` per Mode click with `page_location` like `https://vishalk.com/contact`.

## Step 7 — Google search queries (link Search Console)

The GA tag **cannot** see the words people typed into Google. That lives in Search Console. Linking copies two reports into Analytics ([Connect Search Console](https://support.google.com/analytics/answer/10737381)):

- **Google organic search queries** — queries, clicks, impressions
- **Google organic search traffic** — landing pages for those clicks

**Do:**

1. Finish [Search Console verification](./google-search-console.md) first (you must be a verified owner).
2. In Analytics: **Admin** → **Product links** → **Search Console links** → **Link**.
3. Choose the `vishalk.com` Search Console property and the **vishalk.com** web data stream → submit.
4. The Search Console collection is **unpublished by default**. **Reports** → **Library** → find Search Console → **Publish**.
5. Then **Reports** → **Search Console** → **Google organic search queries** / **Google organic search traffic**.

Data can lag **48 hours**. Search Console itself keeps **16 months**. You can always read the same queries in Search Console → **Performance** → **Search results** without linking.

**Done when:** You can open either the GA Search Console reports or Search Console Performance and see query rows (or an honest empty state if Google has not shown the site yet).

When you share the site yourself (LinkedIn post, email), append UTMs so Direct does not swallow it, for example:

`https://vishalk.com/?utm_source=linkedin&utm_medium=social&utm_campaign=profile`

Use the same three names consistently. Do not put UTMs on the canonical links in the site chrome.

## If you still only see `/`

1. You are on **Landing page** (almost everyone enters on About).
2. Realtime works, standard reports have not caught up.
3. Ad blocker hid your test traffic; there is little other traffic.
4. Enhanced measurement history is still on **and** you are looking at a messy event stream — fix Step 5.
5. Deploy has not reached production yet (this `page_view` change is in the repo, not live until `main` is built on Pages).
