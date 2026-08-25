# Same apex URL on LinkedIn, GitHub, email, resume

Canonical URL (paste this everywhere):

```
https://vishalk.com
```

HTTPS, apex, no path unless you mean a specific page. Never `www`, never `http://`, never `*.pages.dev`.

This does **not** make a Google search for “Vishal Kumar” rank the site. It only joins **this** person to that domain.

| Surface | URL |
| --- | --- |
| Site | https://vishalk.com/ |
| LinkedIn | https://www.linkedin.com/in/vishalkdotcom |
| GitHub | https://github.com/vishalkdotcom |
| Email | hello@vishalk.com |

## Step 1 — LinkedIn Contact info

Official: [Add or remove a website from your profile](https://www.linkedin.com/help/linkedin/answer/a548010). Up to **three** websites. LinkedIn Help documents **Add** and **Remove**, not an in-place edit — remove a wrong URL, then add the apex.

**Do (desktop):**

1. **Me** → **View Profile**.
2. **Contact info** in the introduction.
3. Edit icon.
4. **Remove** any `www` / `http` / preview URL.
5. **Add website** → Website URL `https://vishalk.com` → pick a Website type → **Save**.

Premium “Visit my website” custom button is optional and paid ([custom button](https://www.linkedin.com/help/linkedin/answer/a1484520)). Contact info is the free path.

**Done when:** Signed-out view of the profile lists `https://vishalk.com` and the link opens the apex.

## Step 2 — GitHub website field (not only social links)

The **personal website / portfolio** field is the one GitHub stores as `blog` on the user ([Users API](https://docs.github.com/en/rest/users/users); [profile as resume](https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume)).

**Social accounts** are extra (LinkedIn, etc.). Do **not** put `vishalk.com` only there instead of the website field ([Personalize your profile](https://docs.github.com/en/account-and-profile/tutorials/personalize-your-profile)).

**Do:**

1. Open [https://github.com/settings/profile](https://github.com/settings/profile).
2. Under **Public profile**, set the website / portfolio URL to `https://vishalk.com`.
3. **Update profile**.
4. Optional: **Social accounts** → `https://www.linkedin.com/in/vishalkdotcom`.
5. Optional: profile README in a public repo named `vishalkdotcom` with `[vishalk.com](https://vishalk.com)` ([profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme)).

**Done when:** [https://github.com/vishalkdotcom](https://github.com/vishalkdotcom) shows `https://vishalk.com` as the website for a signed-out visitor.

## Step 3 — Email signature

In the client that sends `hello@vishalk.com`, one line:

```
https://vishalk.com
```

**Done when:** a test message to yourself contains that HTTPS apex line.

## Step 4 — Resume PDF

`vishal-cv.pdf` is a binary. Do **not** hex-edit it in git.

Update the source CV, put `https://vishalk.com` on it, export PDF, replace the file the site serves in a later change if needed.

**Done when:** the downloaded PDF shows the apex HTTPS URL.

## What not to list

- `www.vishalk.com`, `http://`, `*.pages.dev`, a second personal domain
- Google Business Profile / street NAP unless you **want** a public address and phone
