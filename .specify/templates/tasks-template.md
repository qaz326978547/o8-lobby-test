---

description: "功能實作任務清單範本"
---

# 任務清單：[FEATURE NAME]

**輸入**：設計文件來自 `/specs/[###-feature-name]/`

**前置文件**：plan.md（必要）、spec.md（使用者情境必要）、research.md、data-model.md、contracts/

**測試**：以下範例含測試任務。測試為**選填**——僅在功能規格明確要求時才納入。

**組織原則**：任務依使用者情境分組，確保每個情境可獨立實作與測試。

## 格式：`[ID] [P?] [情境] 描述`

- **[P]**：可與其他 [P] 任務並行（不同檔案，無相依）
- **[情境]**：任務所屬的使用者情境（例：US1、US2、US3）
- 描述中須包含完整檔案路徑

## 路徑慣例

- **單一專案**：`src/`、`tests/` 在 repository root
- **Web 應用**：`backend/src/`、`frontend/src/`
- **Mobile**：`api/src/`、`ios/src/` 或 `android/src/`
- 以下路徑以單一專案為例，請依 plan.md 結構調整

<!--
  ============================================================================
  重要：以下任務僅為範例，供說明格式用途。

  /speckit-tasks 指令必須根據以下內容替換為實際任務：
  - spec.md 中的使用者情境（及其優先級 P1、P2、P3⋯）
  - plan.md 中的功能需求
  - data-model.md 中的實體定義
  - contracts/ 中的端點定義

  任務必須依使用者情境組織，使每個情境能：
  - 獨立實作
  - 獨立測試
  - 作為 MVP 增量交付

  請勿將這些範例任務保留在產生的 tasks.md 檔案中。
  ============================================================================
-->

## Phase 1：Setup（共用基礎設施）

**目的**：專案初始化與基本結構建立

- [ ] T001 依實作計畫建立專案結構
- [ ] T002 以 [framework] 依賴初始化 [language] 專案
- [ ] T003 [P] 設定 linting 與格式化工具

---

## Phase 2：Foundational（阻斷性前置任務）

**目的**：所有使用者情境的共用核心基礎設施，完成後方可開始任何情境實作

**⚠️ 重要**：以下任務完成前，任何使用者情境實作均不得開始

以下為基礎任務範例（依專案調整）：

- [ ] T004 建立資料庫 schema 與遷移框架
- [ ] T005 [P] 實作驗證／授權框架
- [ ] T006 [P] 建立 API 路由與中介層結構
- [ ] T007 建立所有情境共用的基礎模型／實體
- [ ] T008 設定錯誤處理與日誌基礎設施
- [ ] T009 設定環境設定管理

**Checkpoint**：Foundation 就緒 — 使用者情境實作可平行開始

---

## Phase 3：使用者情境 1 — [標題]（優先級：P1）🎯 MVP

**目標**：[本情境交付的簡短描述]

**獨立測試**：[如何獨立驗證本情境]

### 使用者情境 1 的測試（選填——僅在明確要求時加入）⚠️

> **注意：請先寫測試，確保測試失敗後再實作**

- [ ] T010 [P] [US1] `tests/contract/test_[name].py` 中的 [endpoint] 契約測試
- [ ] T011 [P] [US1] `tests/integration/test_[name].py` 中的 [使用者旅程] 整合測試

### 使用者情境 1 的實作

- [ ] T012 [P] [US1] 建立 `src/models/[entity1].py` 中的 [Entity1] 模型
- [ ] T013 [P] [US1] 建立 `src/models/[entity2].py` 中的 [Entity2] 模型
- [ ] T014 [US1] 在 `src/services/[service].py` 實作 [Service]（相依 T012、T013）
- [ ] T015 [US1] 在 `src/[location]/[file].py` 實作 [endpoint/feature]
- [ ] T016 [US1] 加入驗證與錯誤處理
- [ ] T017 [US1] 加入使用者情境 1 的日誌記錄

**Checkpoint**：此時使用者情境 1 應可完整獨立運作與測試

---

## Phase 4：使用者情境 2 — [標題]（優先級：P2）

**目標**：[本情境交付的簡短描述]

**獨立測試**：[如何獨立驗證本情境]

### 使用者情境 2 的測試（選填——僅在明確要求時加入）⚠️

- [ ] T018 [P] [US2] `tests/contract/test_[name].py` 中的 [endpoint] 契約測試
- [ ] T019 [P] [US2] `tests/integration/test_[name].py` 中的 [使用者旅程] 整合測試

### 使用者情境 2 的實作

- [ ] T020 [P] [US2] 建立 `src/models/[entity].py` 中的 [Entity] 模型
- [ ] T021 [US2] 在 `src/services/[service].py` 實作 [Service]
- [ ] T022 [US2] 在 `src/[location]/[file].py` 實作 [endpoint/feature]
- [ ] T023 [US2] 與使用者情境 1 元件整合（若需要）

**Checkpoint**：此時使用者情境 1 與 2 應皆可獨立運作

---

## Phase 5：使用者情境 3 — [標題]（優先級：P3）

**目標**：[本情境交付的簡短描述]

**獨立測試**：[如何獨立驗證本情境]

### 使用者情境 3 的測試（選填——僅在明確要求時加入）⚠️

- [ ] T024 [P] [US3] `tests/contract/test_[name].py` 中的 [endpoint] 契約測試
- [ ] T025 [P] [US3] `tests/integration/test_[name].py` 中的 [使用者旅程] 整合測試

### 使用者情境 3 的實作

- [ ] T026 [P] [US3] 建立 `src/models/[entity].py` 中的 [Entity] 模型
- [ ] T027 [US3] 在 `src/services/[service].py` 實作 [Service]
- [ ] T028 [US3] 在 `src/[location]/[file].py` 實作 [endpoint/feature]

**Checkpoint**：所有使用者情境應均可獨立運作

---

[視需要依同樣格式新增更多使用者情境 Phase]

---

## Phase N：Polish 與跨情境議題

**目的**：影響多個使用者情境的改善

- [ ] TXXX [P] 在 `docs/` 更新文件
- [ ] TXXX 程式碼清理與重構
- [ ] TXXX 效能優化（跨所有情境）
- [ ] TXXX [P] 額外單元測試（若需要）於 `tests/unit/`
- [ ] TXXX 安全性強化
- [ ] TXXX 執行 quickstart.md 驗收

---

## 相依與執行順序

### Phase 相依關係

- **Setup（Phase 1）**：無相依，立即可開始
- **Foundational（Phase 2）**：須等 Setup 完成 — 阻斷所有使用者情境
- **使用者情境（Phase 3+）**：皆須等 Foundational 完成
  - 使用者情境可並行推進（若有人力）
  - 或依優先級順序推進（P1 → P2 → P3）
- **Polish（最終 Phase）**：須等所有目標情境完成

### 使用者情境相依關係

- **使用者情境 1（P1）**：Foundational 完成後即可開始，不相依其他情境
- **使用者情境 2（P2）**：Foundational 完成後可開始 — 可能整合 US1，但應可獨立測試
- **使用者情境 3（P3）**：Foundational 完成後可開始 — 可能整合 US1/US2，但應可獨立測試

### 各情境內部執行順序

- 測試（若包含）必須先寫好且確認失敗，再開始實作
- 模型先於服務
- 服務先於端點
- 核心實作先於整合
- 情境完成後再推進至下一優先級

### 並行機會

- 所有標記 [P] 的 Setup 任務可並行
- 所有標記 [P] 的 Foundational 任務可並行（Phase 2 內部）
- Foundational 完成後，所有使用者情境可並行開始（視團隊人力而定）
- 同一情境內標記 [P] 的測試可並行
- 同一情境內標記 [P] 的模型可並行
- 不同情境可由不同成員並行開發

---

## 並行範例：使用者情境 1

```bash
# 同時啟動使用者情境 1 的所有測試（若有測試需求）：
任務：「tests/contract/test_[name].py 中的 [endpoint] 契約測試」
任務：「tests/integration/test_[name].py 中的 [使用者旅程] 整合測試」

# 同時啟動使用者情境 1 的所有模型：
任務：「建立 src/models/[entity1].py 中的 [Entity1] 模型」
任務：「建立 src/models/[entity2].py 中的 [Entity2] 模型」
```

---

## 實作策略

### MVP 優先（僅使用者情境 1）

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（⚠️ 阻斷所有情境）
3. 完成 Phase 3：使用者情境 1
4. **停止並驗收**：獨立測試使用者情境 1
5. 準備就緒後部署／展示

### 遞增交付

1. Setup + Foundational → 基礎就緒
2. 使用者情境 1 → 獨立測試 → 部署／展示（MVP！）
3. 使用者情境 2 → 獨立測試 → 部署／展示
4. 使用者情境 3 → 獨立測試 → 部署／展示
5. 每個情境各自增加價值，不影響前一個情境

### 並行團隊策略

多位開發者時：

1. 團隊共同完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A：使用者情境 1
   - 開發者 B：使用者情境 2
   - 開發者 C：使用者情境 3
3. 情境各自完成並獨立整合

---

## 備注

- `[P]` 任務 = 不同檔案，無相依，可並行
- 情境標籤將任務連結至特定使用者情境，確保可追溯性
- 每個使用者情境應可獨立完成與測試
- 實作前確認測試已失敗
- 每個任務或邏輯群組完成後 commit
- 可在任何 Checkpoint 停下獨立驗收情境
- 避免：模糊任務、同檔案衝突、破壞獨立性的跨情境相依
