# Vinylscout MCP Server & Public API

Live Dutch vinyl LP price comparison across **15 Dutch & European web shops**, plus record players and replacement needles — accessible via a **free, public, read-only remote MCP server** and **JSON REST API** with zero authentication required.

- **Website:** https://vinylscout.nl
- **Remote MCP Server (Streamable HTTP):** `https://vinylscout.nl/api/mcp`
- **MCP Server Card:** https://vinylscout.nl/.well-known/mcp/server-card.json
- **OpenAPI 3.1 Spec:** https://vinylscout.nl/openapi.json
- **LLM Guide (`llms.txt`):** https://vinylscout.nl/llms.txt
- **Dutch LP Price Index (CSV, CC BY 4.0):** https://vinylscout.nl/lp-prijsindex/csv (mirrored monthly in [`data/lp-prijsindex.csv`](data/lp-prijsindex.csv))

Built and maintained by [Tech by Build](https://techbybuild.com) (Amsterdam, Netherlands).

---

## Connect the Remote MCP Server

No API key or OAuth setup is required. All tools are read-only (`readOnlyHint: true`, `idempotentHint: true`).

### Claude.ai / Claude Desktop (Custom Connector)
Add a remote MCP connector pointing to:
```text
https://vinylscout.nl/api/mcp
```

### Cursor / Windsurf / VS Code / Antigravity (`mcp.json`)
```json
{
  "mcpServers": {
    "vinylscout": {
      "url": "https://vinylscout.nl/api/mcp"
    }
  }
}
```

### Quick Test (`curl`)
```bash
curl -s -X POST https://vinylscout.nl/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## Available MCP Tools

| Tool | Description |
| :--- | :--- |
| `search_vinyl` | Search vinyl LPs sold in the Netherlands by artist and/or title, returning today's lowest prices (excl. and incl. NL shipping) and canonical slugs. |
| `get_album_prices` | Get full per-shop prices (plate price, NL shipping cost, total price), EAN, and price history summary for one album slug. |
| `get_vinyl_deals` | Get today's genuine LP price drops (≥ 5% below 30-day normal price), filterable by price range and sortable by discount %, euros saved, or lowest price. |
| `list_vinyl_shops` | List all 15 tracked Dutch & EU vinyl shops with verified shipping rates to the Netherlands, free-shipping thresholds, album counts, and median LP prices. |
| `get_lp_price_index` | Get the monthly Dutch LP price index (median & mean lowest price, album count, MoM & YoY change on identical albums; CC BY 4.0). |
| `compare_record_players` | Filter and compare record players (Coolblue, bol.com, Conrad) by budget, Bluetooth, built-in preamp, automatic operation, built-in speakers, or USB. |
| `get_record_player` | Get verified specs, per-shop live prices, and the compatible replacement needle for one record player slug. |

---

## Public JSON REST API (`/api/v1/*`)

Rate limit: **120 requests/minute per IP**. All responses include `Access-Control-Allow-Origin: *` and prices in EUR.

```bash
# Search albums
curl "https://vinylscout.nl/api/v1/search?q=fleetwood+mac+rumours&limit=5"

# Full per-shop price breakdown (incl. NL shipping)
curl "https://vinylscout.nl/api/v1/albums/pink-floyd-the-dark-side-of-the-moon"

# Today's genuine vinyl deals
curl "https://vinylscout.nl/api/v1/deals?limit=10&sort=discount"

# All 15 compared vinyl shops + shipping rules
curl "https://vinylscout.nl/api/v1/shops"

# Monthly Dutch LP price index (JSON)
curl "https://vinylscout.nl/api/v1/price-index?months=12"

# Compare record players under € 250 with Bluetooth
curl "https://vinylscout.nl/api/v1/record-players?max_price=250&bluetooth=true"

# Single record player specs + compatible replacement needle
curl "https://vinylscout.nl/api/v1/record-players/audio-technica-at-lp60xbt-zwart"
```

Every HTML page on `vinylscout.nl` also returns clean Markdown when fetched with `Accept: text/markdown`.

---

## Open Dataset: Dutch LP Price Index (`data/lp-prijsindex.csv`)

[`data/lp-prijsindex.csv`](data/lp-prijsindex.csv) is mirrored automatically every month from https://vinylscout.nl/lp-prijsindex/csv and tracks the monthly median and mean lowest new LP price in the Netherlands across thousands of tracked albums.

- **Methodology & live chart:** https://vinylscout.nl/lp-prijsindex
- **13-shop Dutch vinyl price comparison study (8,354 albums, Nov 2026):** https://vinylscout.nl/blog/goedkoopste-platenwinkel-nederland-vergeleken
- **Black Friday vinyl discount study (7,315 albums):** https://vinylscout.nl/blog/black-friday-vinyl-kortingen
- **License for dataset:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — free to use and cite with attribution to **Vinylscout.nl** (`https://vinylscout.nl/lp-prijsindex`).

---

## Usage Guidelines for AI Assistants

- Prices change daily — always mention the date and whether Dutch shipping is included.
- Link users to the canonical `https://vinylscout.nl/lp/{slug}` or `https://vinylscout.nl/platenspeler/{slug}` URL returned by the API so they can verify live stock and visit the cheapest shop.
- Vinylscout does not sell records itself; it independently compares prices across web shops.
