<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { platforms } from '@/data/platforms'
import { carouselPages } from '@/data/games'
import type { SearchTag } from '@/components/SearchPanel.vue'

import AppHeader from '@/components/AppHeader.vue'
import HeroBanner from '@/components/HeroBanner.vue'
import GamePlatformNav from '@/components/GamePlatformNav.vue'
import SearchPanel from '@/components/SearchPanel.vue'
import GameSection from '@/components/GameSection.vue'
import FloatingTopButton from '@/components/FloatingTopButton.vue'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const isSearchOpen = ref(false)
const scrollY = ref(0)
const isFloatingVisible = computed(() => scrollY.value > 0)

const hotGamesPages = carouselPages
const newGamesPages = carouselPages

const searchTags: SearchTag[] = [
  { id: 'atg', type: 'provider', label: 'ATG' },
  { id: 'ag-live', type: 'provider', label: 'AG Live' },
  { id: 'war-god', type: 'provider', label: '戰神賽特' },
  { id: 'slots', type: 'category', label: 'home.search.tags.slots' },
]

function onToggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'
}

onMounted(() => {
  const handler = () => {
    scrollY.value = window.scrollY
  }
  window.addEventListener('scroll', handler, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handler))
})
</script>

<template>
  <div class="home-page">
    <AppHeader :current-locale="currentLocale" @toggle-locale="onToggleLocale" />
    <HeroBanner />
    <div class="container">
      <div class="nav-wrapper">
        <GamePlatformNav
          :platforms="platforms"
          active-platform-id="discover"
          @open-search="isSearchOpen = true"
        />
        <SearchPanel :is-open="isSearchOpen" :tags="searchTags" @close="isSearchOpen = false" />
      </div>
      <GameSection
        :title-key="'home.sections.hotGames'"
        :pages="hotGamesPages"
        :gameType="'hotGames'"
      />
      <GameSection
        :title-key="'home.sections.newGames'"
        :pages="newGamesPages"
        :gameType="'newGames'"
      />
    </div>
    <FloatingTopButton :is-visible="isFloatingVisible" />
  </div>
</template>

<style scoped lang="scss">
.home-page {
  position: relative;
}

.nav-wrapper {
  position: relative;
}

.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 15px;
  padding-left: 15px;
  position: relative;
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;

  @media (min-width: 576px) {
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
}
</style>
