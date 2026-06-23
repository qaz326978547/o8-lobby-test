<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameCard } from '@/data/games'
import GameCardComponent from '@/components/GameCard.vue'

const props = defineProps<{
  titleKey: string
  gameType: string
  pages: GameCard[][]
}>()

const { t } = useI18n()
const currentPage = ref(0)
const carouselRef = ref<HTMLElement | null>(null)

let intervalId: ReturnType<typeof setInterval>
let touchStartX = 0
let touchStartY = 0

function startAutoPlay() {
  clearInterval(intervalId)
  intervalId = setInterval(() => {
    currentPage.value = (currentPage.value + 1) % props.pages.length
  }, 5000)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
  touchStartY = e.touches[0]?.clientY ?? 0
}

function onTouchMove(e: TouchEvent) {
  const dx = Math.abs((e.touches[0]?.clientX ?? touchStartX) - touchStartX)
  const dy = Math.abs((e.touches[0]?.clientY ?? touchStartY) - touchStartY)
  if (dx > dy) e.preventDefault()
}

function onTouchEnd(e: TouchEvent) {
  const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
  if (Math.abs(deltaX) < 50) return
  if (deltaX < 0) {
    currentPage.value = (currentPage.value + 1) % props.pages.length
  } else {
    currentPage.value = (currentPage.value - 1 + props.pages.length) % props.pages.length
  }
  startAutoPlay()
}

onMounted(() => {
  startAutoPlay()
  carouselRef.value?.addEventListener('touchstart', onTouchStart, { passive: true })
  carouselRef.value?.addEventListener('touchmove', onTouchMove, { passive: false })
  carouselRef.value?.addEventListener('touchend', onTouchEnd, { passive: true })
})

onUnmounted(() => {
  clearInterval(intervalId)
  carouselRef.value?.removeEventListener('touchstart', onTouchStart)
  carouselRef.value?.removeEventListener('touchmove', onTouchMove)
  carouselRef.value?.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <section class="game-section">
    <div class="game-section__header">
      <img class="game-section__icon" :src="`/assets/images/icons/${props.gameType}.png`" alt="" />
      <h2 class="game-section_title">{{ t(props.titleKey) }}</h2>
    </div>

    <div ref="carouselRef" class="game-section__carousel">
      <Transition name="fade" mode="out-in">
        <div :key="currentPage" class="game-section__grid">
          <GameCardComponent
            v-for="card in props.pages[currentPage]"
            :key="card.id"
            :image-path="card.imagePath"
            :name="card.name"
            :value="card.value"
            :capsule-color="card.capsuleColor"
          />
        </div>
      </Transition>
    </div>

    <div class="game-section__indicators">
      <div
        v-for="(_, index) in props.pages"
        :key="index"
        class="game-section__progress-bar"
        :class="{ 'game-section__progress-bar--active': index === currentPage }"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.game-section {
  padding: 16px;

  &_title {
    font-size: 18px;
    color: #1a1a1a;
  }

  &__icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    object-fit: contain;
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 16px;
    color: #1a1a1a;
  }

  &__carousel {
    min-height: 240px;
    position: relative;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  &__indicators {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  &__progress-bar {
    flex: 1;
    max-width: 40px;
    height: 3px;
    background: rgba(174, 134, 64, 0.2);
    border-radius: 2px;
    transition: background 0.3s ease;

    &--active {
      background: #ae8640;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
