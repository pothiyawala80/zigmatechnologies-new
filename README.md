# Zigma Technologies Solutions — Website

Open `index.html` to view the site. Everything it needs is in this folder (fonts, animation libraries, logos), so it works offline too.

## Folder contents
| File / folder | What it is |
|---|---|
| `index.html` | The website |
| `add-project.html` | Project Manager: add, edit or reorder your past work (for you only, not linked on the site) |
| `assets/projects.js` | Your project list, shown in the "Selected work" section |
| `assets/site-config.js` | Email, phone, WhatsApp number, chat greeting and FAQ text |
| `assets/work/` | Put project screenshots here |
| `assets/team/` | Team photos (`kadir.jpg`) |
| `assets/tech/` | Technology logos |

## Add your past work
1. Open `add-project.html` in your browser, fill in the form and click **Add to list**.
2. Click **Download projects.js** and put the downloaded file in `assets/`, in place of the old one.
3. Put screenshots in `assets/work/` and set `image: "assets/work/your-file.jpg"`. If a project has no screenshot, the site makes a cover automatically.

> The 4 projects showing now are EXAMPLES. Replace them before going live.

## Change contact details or FAQs
Edit `assets/site-config.js`.
**Optional:** create a free form at formspree.io and paste its link into `formEndpoint`. Contact-form messages then arrive straight in your inbox, without the visitor's email app opening.

## Add Musrif's photo
Save the photo as `assets/team/musrif.jpg`. Then in `index.html`, find `<div class="ph"><b>M</b></div>` and replace it with:
`<div class="ph"><img src="assets/team/musrif.jpg" alt="Musrif, Director & Co-Founder"></div>`

## Go live (GitHub Pages)
Copy everything in this folder into your website repository (keep your `CNAME` file), then commit and push.
