# UI 合約：EmptyState.vue

**元件路徑**：`src/components/EmptyState.vue`  
**日期**：2026-06-21

---

## Props 介面

```ts
const props = withDefaults(defineProps<{
  imageSrc?: string   // 預設：'/assets/images/no-data.png'
  message?: string    // 未傳入時：元件內使用 t('home.search.emptyState')
}>(), {
  imageSrc: '/assets/images/no-data.png',
})
const { t } = useI18n()
const displayMessage = computed(() => props.message ?? t('home.search.emptyState'))
```

## 使用範例

```vue
<!-- 省略所有 props — 使用預設值 -->
<EmptyState />

<!-- 覆寫 message -->
<EmptyState :message="t('some.other.key')" />

<!-- 完全自訂（例外情況） -->
<EmptyState image-src="/assets/images/no-data.png" :message="customMsg" />
```

## 視覺規格

- 容器：垂直置中、`flex-direction: column`、`align-items: center`、上下 padding 32px。
- 圖片：`width: 80px`、`height: 80px`、`object-fit: contain`，`alt=""`（純裝飾）。
- 文字：`font-size: 13px`、`color: #888`、`margin-top: 12px`、`text-align: center`。

## 禁止事項

- 不使用 `no-data.png` 作為遊戲卡片或供應商 icon 的 fallback（此元件為獨立空狀態 UI）。
- 不 hardcode 文字（message 從 i18n 或 props 取得）。
- 不新增 `loading`、`error` 或其他 props（YAGNI）。
- 圖片路徑注意：正確路徑為 `/assets/images/no-data.png`，非 `/assets/images/icons/no-data.png`。
