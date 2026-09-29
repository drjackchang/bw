# Professor Brett Williams — 個人網站

延續原始設計（Inter 字型、深藍配色、Impact Dashboard），把「著作清單」改成資料驅動並串接 ORCID 自動同步，跟老師本人的 drjackchang.org 用同一套機制。其餘區塊（首頁數據、Leadership、聯絡資訊）維持原本的靜態內容。

## 上傳到 GitHub Pages

1. 到 GitHub 新增一個 repository，把整個資料夾內容上傳上去（`.github` 是隱藏資料夾，用網頁版「Add file → Create new file」直接打完整路徑 `.github/workflows/sync-orcid.yml` 建立，拖拉上傳法很容易漏掉它）
2. Repo 頁面 → **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 `main` / `/(root)`
3. 如果要接自訂網域，另外加一個 `CNAME` 檔案

## 著作清單怎麼運作

- `data/publications.json` 是著作清單的資料來源，`index.html` 用 `js/main.js` 抓取並渲染，預設顯示最新 6 筆，超過會出現「Show more」
- 手動新增一篇著作：複製 `data/publications.json` 裡現有的格式，加一筆新物件（記得每筆之間用逗號分隔）
- `.github/workflows/sync-orcid.yml` 每週一自動執行 `scripts/sync-orcid.js`，呼叫 ORCID 公開 API（**0000-0001-6307-1779**），把還沒收錄的新著作加進 `data/publications.json` 並自動 commit
- 瀏覽器端沒辦法直接呼叫 ORCID API（會被 CORS 擋掉），所以同步是在 GitHub Actions 的伺服器端做的，網站本身仍是純靜態檔案
- ORCID 的 works API 不包含完整作者名單，自動加入的新項目 `authors` 會先填「Williams B, et al.」、標記 `"needs_review": true`，之後手動補完整作者順序
- 想立刻測試：repo 的 **Actions** 頁籤 → 選 `Sync ORCID publications` → **Run workflow** 手動觸發一次，不用等到下週一

## 本機預覽

網站用 `fetch()` 讀 JSON，**不能**直接雙擊打開 `index.html`。本機測試：

```
python3 -m http.server 8000
```

再開瀏覽器到 `http://localhost:8000`。
