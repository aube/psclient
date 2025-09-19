<script setup>
import Button from 'primevue/button';
import Chip from 'primevue/chip';
</script>


<template>
  <div class="bg-surface-0 dark:bg-surface-950 px-8 md:px-20 py-12 md:py-20 lg:px-80">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 pb-4">
        <div class="font-semibold text-xl text-surface-900 dark:text-surface-0 leading-tight">
          Movie Information
        </div>
        <div class="text-surface-500 dark:text-surface-300 text-base leading-tight">
          Morbi tristique blandit turpis. In viverra ligula id nulla hendrerit rutrum.
        </div>
      </div>

      <div class="border-t border-surface-200 dark:border-surface-700" />

      <div class="flex flex-col gap-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-[140px] text-surface-900 dark:text-surface-0 font-medium text-base leading-tight">
              Title
            </div>
            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base leading-tight">
              Heat
            </div>
          </div>
          <div class="flex justify-end">
            <Button
              class="shrink-0"
              icon="pi pi-pen-to-square"
              icon-only
              outlined
              rounded
              severity="secondary"
            />
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700" />

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-[140px] text-surface-900 dark:text-surface-0 font-medium text-base leading-tight">
              Genre
            </div>
            <div class="flex-1 flex flex-wrap gap-2">
              <Chip
                label="Crime"
                severity="secondary"
              />
              <Chip
                label="Drama"
                severity="secondary"
              />
              <Chip
                label="Thriller"
                severity="secondary"
              />
            </div>
          </div>
          <div class="flex justify-end">
            <Button
              class="shrink-0"
              icon="pi pi-pen-to-square"
              icon-only
              outlined
              rounded
              severity="secondary"
            />
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700" />

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-[140px] text-surface-900 dark:text-surface-0 font-medium text-base leading-tight">
              Director
            </div>
            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base leading-tight">
              Michael Mann
            </div>
          </div>
          <div class="flex justify-end">
            <Button
              class="shrink-0"
              icon="pi pi-pen-to-square"
              icon-only
              outlined
              rounded
              severity="secondary"
            />
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700" />

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-[140px] text-surface-900 dark:text-surface-0 font-medium text-base leading-tight">
              Writer
            </div>
            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base leading-tight">
              Michael Mann
            </div>
          </div>
          <div class="flex justify-end">
            <Button
              class="shrink-0"
              icon="pi pi-pen-to-square"
              icon-only
              outlined
              rounded
              severity="secondary"
            />
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700" />

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-start gap-4 flex-1">
            <div class="w-[140px] text-surface-900 dark:text-surface-0 font-medium text-base leading-tight">
              Plot
            </div>
            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base leading-normal">
              A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist.
            </div>
          </div>
          <div class="flex justify-end">
            <Button
              class="shrink-0"
              icon="pi pi-pen-to-square"
              icon-only
              outlined
              rounded
              severity="secondary"
            />
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700" />
      </div>
    </div>
  </div>
</template>