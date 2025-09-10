<script setup lang="ts">
import EntPagesListItem from './EntPagesListItem.vue';
import { IPage } from './page.ts';

defineProps<{
  pages: Array<IPage>;
  loading?: boolean;
  error?: string | null;
}>();
</script>

<template>
  <div class="pages-list">
    <div
      v-if="loading"
      class="loading"
    >
      Загрузка...
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <template v-else>
      <div
        v-if="pages.length === 0"
        class="empty"
      >
        Страницы не найдены
      </div>
      <EntPagesListItem
        v-for="page in pages"
        :key="page.id"
        :page="page"
      />
    </template>
  </div>
</template>

<style scoped>
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.loading, .error, .empty {
  padding: 1rem;
  text-align: center;
}
.error {
  color: red;
}
</style>
