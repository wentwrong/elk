<script setup lang="ts">
const props = defineProps<{
  code: string
  lang?: string
}>()

const raw = $computed(() => decodeURIComponent(props.code).replace(/&#39;/g, '\''))

const langMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  vue: 'html',
}

const highlighted = computed(() => {
  return props.lang ? highlightCode(raw, (langMap[props.lang] || props.lang) as any) : raw
})
</script>

<template>
  <pre class="code-block" v-html="highlighted" />
</template>
