# 🥏 RazorDisc — Team Builder

A browser-based team/character builder for **RazorDisc**, a fictional futuristic sport.  
Spend **1500 CR** across 5 positional player slots to assemble your squad.

## Features

| Feature | Details |
|---|---|
| 💰 Budget tracker | Live CR bar showing remaining credits out of 1500 |
| 🧑‍🤝‍🧑 5 positions | Striker (400 CR), Goalkeeper (350 CR), Defender (300 CR), Midfielder (250 CR), Utility (200 CR) |
| 💾 Auto-save | Roster persists in `localStorage` (cookie fallback) across page refreshes |
| 📥 Export | Download your roster as a `.json` file |
| 📤 Import | Load a previously exported `.json` file |
| 📱 Responsive | Works on desktop and mobile |

## File Structure

```
index.html   — Main app page
style.css    — Dark sci-fi theme styles
app.js       — All application logic
README.md    — This file
```

## Running Locally

Just open `index.html` in any modern browser — no build tools or server needed.

## Enabling GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Source**, select **Deploy from a branch**.
4. Choose the **`main`** branch and **`/ (root)`** folder, then click **Save**.
5. After a minute or two, your site will be live at:  
   `https://<your-username>.github.io/razordisc/`

## License

MIT