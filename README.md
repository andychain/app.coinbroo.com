# Coinbroo — Hyperliquid Perps Frontend

A perps trading interface built on Hyperliquid L1. Deploys to Cloudflare Pages.

## Quick start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_BUILDER_ADDRESS=0xYOUR_WALLET_ADDRESS
NEXT_PUBLIC_REFERRAL_CODE=YOURCODE
NEXT_PUBLIC_BUILDER_FEE=3
NEXT_PUBLIC_APP_NAME=Coinbroo
```

### 3. Get a WalletConnect project ID
Go to https://cloud.walletconnect.com and create a free project.
Paste the project ID into `src/lib/providers.tsx` (the `projectId` field).

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Build for production
```bash
npm run build
```
Output goes to `out/` — this is what Cloudflare Pages deploys.

---

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to Cloudflare Pages → Create project → Connect to Git
3. Select your repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: `20`
5. Add environment variables (same as `.env.local`) under Settings → Environment Variables
6. Deploy

---

## Key files

| File | Purpose |
|------|---------|
| `src/lib/hyperliquid.ts` | All Hyperliquid API calls |
| `src/lib/signing.ts` | EIP-712 signing: ApproveBuilderFee, orders, withdraw |
| `src/lib/providers.tsx` | Wagmi + RainbowKit setup |
| `src/hooks/useOnboarding.ts` | First-user flow: new user check + ApproveBuilderFee |
| `src/hooks/useHLWebSocket.ts` | Live WebSocket data |
| `src/hooks/useAccountHL.ts` | Account state, positions, PnL |
| `src/components/ui/OnboardingModal.tsx` | First-visit modal with signature flow |
| `src/components/trading/TradePanel.tsx` | Order form with builder code on every order |
| `src/components/trading/OrderBook.tsx` | Live bid/ask depth |
| `src/components/trading/Positions.tsx` | Open positions, orders, history |

---

## Changing your builder wallet

To switch to a dedicated builder wallet later:

1. Update `NEXT_PUBLIC_BUILDER_ADDRESS` in Cloudflare Pages environment variables
2. Make sure the new wallet has 100+ USDC in Hyperliquid perps
3. Redeploy — takes ~1 minute

Existing users will need to sign a new `ApproveBuilderFee` for the new address.
Clear `localStorage` key `ht_builder_approved` to re-trigger the approval flow.

---

## Adding TradingView chart

In `src/app/page.tsx`, replace the chart placeholder with:
```html
<script src="https://s3.tradingview.com/tv.js"></script>
<div id="tv-chart" style="height:100%"></div>
<script>
  new TradingView.widget({
    container_id: 'tv-chart',
    symbol: `HYPERLIQUID:${selectedCoin}USDT`,
    interval: '15',
    theme: 'dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#0d0e12',
    hide_side_toolbar: false,
  })
</script>
```
