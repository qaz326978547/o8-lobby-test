<script setup lang="ts">
import type { CapsuleColor } from '@/data/games'

const props = defineProps<{
  imagePath: string
  name: string
  value: number
  capsuleColor: CapsuleColor
}>()

const capsuleBg = props.capsuleColor === 'red' ? '#ce2727' : '#35bd13'
</script>

<template>
  <div class="game-card">
    <div class="game-card__image">
      <img :src="imagePath" :alt="name" />
    </div>
    <div class="game-card__footer">
      <span class="game-card__title">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &__image {
    width: 100%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: #ae8640;
    min-height: 36px;
  }

  &__title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  &__capsule {
    display: flex;
    align-items: center;
    gap: 3px;
    border-radius: 12px;
    padding: 2px 6px;
    flex-shrink: 0;
  }

  &__value {
    font-size: 11px;
    font-weight: 700;
    color: #fff;
  }

  &__icon {
    width: 12px;
    height: 12px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
}
</style>
