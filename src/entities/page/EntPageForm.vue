<script setup lang="ts">
import { ref, watch } from 'vue';
import { IPage } from './page.ts';


const props = defineProps<{
  page: IPage|null;
}>();

const emit = defineEmits<{
  (e: 'submit', page: IPage): void;
  (e: 'cancel'): void;
}>();

const localPage = ref<IPage>({
  id: 0,
  name: '',
  h1: '',
  meta: '',
  title: '',
  category: '',
  template: 'default',
  content: '',
  content_short: '',
  created_at: '',
  updated_at: '',
});

// Инициализация формы
watch(() => props.page, (newPage) => {
  if (newPage) {
    localPage.value = { ...newPage };
  } else {
    localPage.value = {
      id: 0,
      name: '',
      h1: '',
      meta: '',
      title: '',
      category: '',
      template: 'default',
      content: '',
      content_short: '',
      created_at: '',
      updated_at: '',
    };
  }
}, { immediate: true });

const emitSubmit = () => {
  emit('submit', localPage.value);
};

const emitCancel = () => {
  emit('cancel');
};
</script>

<template>
  <form @submit.prevent="emitSubmit">
    <div>
      <h3>Основная информация</h3>

      <div>
        <label>Название (системное)</label>
        <input
          v-model="localPage.name"
          required
          type="text"
        >
      </div>

      <div>
        <label>Заголовок H1</label>
        <input
          v-model="localPage.h1"
          required
          type="text"
        >
      </div>

      <div>
        <label>Категория</label>
        <input
          v-model="localPage.category"
          type="text"
        >
      </div>

      <div>
        <label>Шаблон</label>
        <select v-model="localPage.template">
          <option value="default">
            По умолчанию
          </option>
          <option value="home">
            Главная
          </option>
          <option value="blog">
            Блог
          </option>
        </select>
      </div>
    </div>

    <div>
      <h3>SEO настройки</h3>

      <div>
        <label>Title</label>
        <input
          v-model="localPage.title"
          type="text"
        >
      </div>

      <div>
        <label>Meta description</label>
        <textarea
          v-model="localPage.meta"
          rows="3"
        />
      </div>
    </div>

    <div>
      <h3>Контент</h3>

      <div>
        <label>Краткое описание</label>
        <textarea
          v-model="localPage.content_short"
          rows="4"
        />
      </div>

      <div>
        <label>Полный контент</label>
        <textarea
          v-model="localPage.content"
          rows="8"
        />
      </div>
    </div>

    <div>
      <button
        type="button"
        @click="emitCancel"
      >
        Отмена
      </button>
      <button type="submit">
        Сохранить
      </button>
    </div>
  </form>
</template>