<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()

useHeadFixed({
  title: () => t('nav.muted_users'),
})
</script>

<template>
  <MainContent back>
    <template #title>
      <span timeline-title-style>{{ $t('nav.muted_users') }}</span>
    </template>

    <TimelineMutes v-if="isMastoInitialised" />
  </MainContent>
</template>
