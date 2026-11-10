# 實測腳本

用 Playwright 在手機尺寸的 Chrome 上實際操作 App。需要：Python 3、`pip install playwright`、系統有 `/usr/bin/google-chrome`。

- `e2e.py`、`e2e3.py`、`anim.py`：先 `npm run build && npx vite preview --port 4173`，再 `python3 e2e/e2e.py`
- `offline.py`：用子路徑建置後在 4174 埠提供：
  `npx vite build --base=/claude.ai/ --outDir /tmp/sub/claude.ai && (cd /tmp/sub && python3 -m http.server 4174)`，再 `python3 e2e/offline.py`
