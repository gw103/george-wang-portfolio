# Chatbot setup (Gemini through a Cloudflare Worker)

## How it works

```
visitor's browser  ->  Cloudflare Worker  ->  Gemini API
   (script.js)        (worker/gemini-proxy.js,
                       holds the API key)
```

- The Gemini API key is a **secret on the Worker**. It is never in this repo or in the site's JavaScript.
- The bot's persona and facts are in `chatbot-context.txt`. The Worker reads that file from the live site.
- If the Worker is not configured or a call fails, the chatbot answers from the built-in responses in `script.js` (`getFallbackResponse`).

**Do not paste an API key into `script.js`.** Google scans public repos and websites and disables keys it finds. That is what happened to the original key ("Your API key was reported as leaked").

## One-time setup

1. **Push this repo** so `chatbot-context.txt` is live at `<your site>/chatbot-context.txt`.
2. **Create a Gemini API key** at <https://aistudio.google.com/apikey>.
   - Restrict it to the Gemini API only.
   - Do not add a website restriction: the Worker calls Google, not the visitor's browser.
   - Delete the old leaked key while you are there.
3. **Create the Worker** at <https://dash.cloudflare.com> (free plan is enough):
   Workers & Pages -> Create -> Worker (Hello World template) -> Deploy -> Edit code.
   Replace all of the code with the contents of `worker/gemini-proxy.js`, then Deploy.
4. **Add the settings** under the Worker's Settings -> Variables and Secrets:

   | Name | Type | Value |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | Secret | the key from step 2 |
   | `SITE_URL` | Text | the portfolio's address, no trailing slash, e.g. `https://gw103.github.io/george-wang-portfolio` |

5. **Point the site at the Worker**: copy the Worker's URL (looks like `https://<name>.<account>.workers.dev`) into `this.proxyUrl` near the top of `script.js`. Commit and push.
6. **Test on the live site** (not from a file on disk) with the browser's DevTools Console open. `Chat proxy status: 200` means Gemini answered.

Dashboard labels change over time; the names above may differ slightly.

## Troubleshooting

The Console shows `Chat proxy error: ...` with one of these messages:

| Message | Meaning |
| --- | --- |
| `Origin not allowed` | `SITE_URL` does not match the address the page is served from. Also appears when the page is opened from disk or localhost. |
| `Worker is missing GEMINI_API_KEY or SITE_URL` | A setting from step 4 is missing or misspelled. |
| `Could not load chatbot-context.txt` | `SITE_URL` has the wrong path, or the file has not been pushed. |
| `Gemini returned HTTP 403 PERMISSION_DENIED` | The key is invalid, unrestricted, or was reported as leaked. Create a new one. |
| `Gemini returned HTTP 429 RESOURCE_EXHAUSTED` | Quota is used up, or the key has been blocked. |
| `Gemini returned HTTP 400 FAILED_PRECONDITION` | Usually means Gemini is not available in the region the request came from. |
| `Gemini returned HTTP 404` | The model was retired. Update `MODEL` in the Worker (see <https://ai.google.dev/gemini-api/docs/models>). |

Full error details are in the Worker's logs in the Cloudflare dashboard.

## Keeping the bot up to date

When the portfolio changes, update both:

- `chatbot-context.txt`: what the AI knows.
- `getFallbackResponse()` in `script.js`: the built-in answers, in English and Chinese.

The Worker only needs redeploying if `worker/gemini-proxy.js` itself changes.
