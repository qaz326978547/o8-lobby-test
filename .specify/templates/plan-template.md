# 實作計畫：[FEATURE]

**分支**：`[###-feature-name]` | **日期**：[DATE] | **規格**：[link]

**輸入**：功能規格來自 `/specs/[###-feature-name]/spec.md`

**注意**：本範本由 `/speckit-plan` 指令填寫。執行流程詳見 `.specify/templates/plan-template.md`。

## 摘要

[從功能規格中擷取：主要需求 + 研究階段的技術方向]

## 技術環境

<!--
  必要動作：請將本節內容替換為本專案的技術細節。
  以下結構僅供參考，用以引導迭代過程。
-->

**語言／版本**：[例：Python 3.11、Swift 5.9、Rust 1.75，或「待釐清」]

**主要依賴**：[例：FastAPI、UIKit、LLVM，或「待釐清」]

**儲存**：[若適用，例：PostgreSQL、CoreData、檔案系統；不適用則填 N/A]

**測試**：[例：pytest、XCTest、cargo test，或「待釐清」]

**目標平台**：[例：Linux 伺服器、iOS 15+、WASM，或「待釐清」]

**專案類型**：[例：library/cli/web-service/mobile-app/compiler/desktop-app，或「待釐清」]

**效能目標**：[領域相關，例：1000 req/s、10k 行/秒、60fps，或「待釐清」]

**限制**：[領域相關，例：p95 < 200ms、記憶體 < 100MB、支援離線，或「待釐清」]

**範圍／規模**：[領域相關，例：10k 使用者、1M LOC、50 個畫面，或「待釐清」]

## 憲法檢查

*閘門：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

[依據憲法文件決定各閘門]

## 專案結構

### 規格文件（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本文件（/speckit-plan 指令輸出）
├── research.md          # Phase 0 輸出（/speckit-plan 指令）
├── data-model.md        # Phase 1 輸出（/speckit-plan 指令）
├── quickstart.md        # Phase 1 輸出（/speckit-plan 指令）
├── contracts/           # Phase 1 輸出（/speckit-plan 指令）
└── tasks.md             # Phase 2 輸出（/speckit-tasks 指令 — 非 /speckit-plan 產出）
```

### 原始碼（repository root）
<!--
  必要動作：請將下方佔位結構替換為本功能的實際路徑。
  刪除未使用的選項，並以真實路徑展開選定結構（例：apps/admin、packages/something）。
  最終交付的計畫不得保留「Option」標籤。
-->

```text
# [若未使用請移除] 選項 1：單一專案（預設）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [若未使用請移除] 選項 2：Web 應用（偵測到「frontend」+「backend」時）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [若未使用請移除] 選項 3：Mobile + API（偵測到「iOS/Android」時）
api/
└── [同上方 backend 結構]

ios/ 或 android/
└── [平台專屬結構：功能模組、UI 流程、平台測試]
```

**結構決策**：[說明所選結構及上方擷取的實際目錄]

## 複雜度追蹤

> **僅在憲法檢查有違規且必須說明時填寫**

| 違規項目 | 必要原因 | 放棄更簡單替代方案的理由 |
|---------|---------|----------------------|
| [例：第 4 個子專案] | [當前需求] | [為何 3 個子專案不足] |
| [例：Repository pattern] | [具體問題] | [為何直接存取 DB 不足] |
