# UI 合約：SearchView.vue（⚠️ 已調整為 Stub）

**元件路徑**：`src/views/SearchView.vue`  
**路由**：`/search`（保留路由定義，但此頁面不再作為主要搜尋結果 UI）  
**日期**：2026-06-21（更新：2026-06-22）

---

## 重要說明

> **架構調整（2026-06-22）**：搜尋結果不再顯示於獨立的 `/search` 頁面。
> 搜尋結果改為在首頁 `/` 的 `SearchPanel` overlay 下方以可捲動方式顯示。
> 本元件維持 stub 狀態，路由保留以避免深度連結 404，但核心搜尋 UI 由 `SearchPanel.vue` 承擔。

---

## 現行職責

- **SearchView.vue** 為空元件（stub），僅確保 `/search` 路由不產生 404。
- 主要搜尋功能（keyword 輸入、API 呼叫、三段結果顯示）均在 `SearchPanel.vue` 中實作。

---

## 搜尋流程（新）

```
首頁（/）
├── 使用者點擊搜尋 icon
├── SearchPanel overlay 展開
├── 使用者輸入 keyword（debounce 300ms）
├── SearchPanel 呼叫 lobbyStore.searchLobby()
├── 結果顯示在 SearchPanel 下方可捲動區域
│   ├── 三段分區（games / providers / gameTypes）
│   └── 無結果 → EmptyState
├── 點擊 provider 結果 → router.push('/search/provider/:code?keyword=xxx')
└── 點擊 gameType 結果 → router.push('/search/game-type/:code?keyword=xxx')
```

---

## 已移除的職責

以下功能曾規劃在 SearchView.vue，現已移至 SearchPanel.vue：

- `keyword` 與路由 query string 同步
- `lobbyStore.searchLobby()` 呼叫
- 三段搜尋結果顯示（games / providers / gameTypes）
- `EmptyState` 顯示（無結果狀態）
- X 按鈕關閉搜尋

---

## 禁止事項

- 不在此 stub 元件中新增任何搜尋 UI 邏輯。
- 不從 ProviderGamesView / GameTypeGamesView 返回至此路由（返回改至 `/`）。
