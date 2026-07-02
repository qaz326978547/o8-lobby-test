<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLobbyStore } from '@/stores/lobby'

export interface SearchTag {
  id: string
  label: string
  searchValue: string
}

defineProps<{
  isOpen: boolean
  tags: SearchTag[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const lobbyStore = useLobbyStore()
const keyword = ref('')

watch(keyword, (val) => {
  lobbyStore.searchKeyword = val
})

async function triggerSearch(searchValue: string) {
  if (!searchValue.trim()) return
  await lobbyStore.executeSearch(searchValue)
  emit('close')
}

function onKeyEnter() {
  triggerSearch(keyword.value)
}

function onSearchIconClick() {
  triggerSearch(keyword.value)
}

function onTagClick(tag: SearchTag) {
  triggerSearch(tag.searchValue)
}

function onClose() {
  keyword.value = ''
  lobbyStore.searchKeyword = ''
  emit('close')
}
</script>

<template>
  <div v-if="isOpen">
    <Teleport to="body">
      <div class="search-panel__overlay" @click="onClose" />
    </Teleport>
    <div class="search-panel" @click.stop>
      <div class="search-panel__bar">
        <input
          v-model="keyword"
          class="search-panel__input"
          type="text"
          :placeholder="t('home.search.placeholder')"
          autofocus
          @keyup.enter="onKeyEnter"
        />
        <button type="button" class="search-panel__clear" @click="onClose">
          {{ t('home.search.clear') }}
        </button>
        <img
          class="search-panel__icon"
          src="/assets/images/icons/search.png"
          alt=""
          @click="onSearchIconClick"
        />
      </div>
      <div class="search-panel__tags">
        <span
          v-for="tag in tags"
          :key="tag.id"
          class="search-panel__tag search-panel__tag--clickable"
          @click="onTagClick(tag)"
        >{{ tag.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-panel__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: var(--z-overlay, 100);
}

.search-panel {
  position: absolute;
  top: 0;
  left: -15px;
  right: -15px;
  z-index: var(--z-panel, 101);
  background: #fff;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (min-width: 576px) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 540px;
  }

  @media (min-width: 768px) {
    max-width: 720px;
  }

  @media (min-width: 992px) {
    max-width: 960px;
  }

  @media (min-width: 1200px) {
    max-width: 1140px;
  }

  @media (min-width: 1400px) {
    max-width: 1320px;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f5f5f5;
    border-radius: 24px;
    padding: 10px 16px;
  }

  &__input {
    flex: 1;
    border: none;
    background: none;
    font-size: 14px;
    color: #1a1a1a;
    outline: none;

    &::placeholder {
      color: #aaa;
    }
  }

  &__clear {
    font-size: 13px;
    color: #ae8640;
    font-weight: 600;
    white-space: nowrap;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    opacity: 0.5;
    cursor: pointer;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__tag {
    background: #f0f0f0;
    border-radius: 16px;
    padding: 6px 14px;
    font-size: 13px;
    color: #444;

    &--clickable {
      cursor: pointer;

      &:active {
        background: #e0e0e0;
      }
    }
  }
}
</style>
