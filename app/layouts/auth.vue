<template>
  <main class="auth-layout">
    <slot />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
}

body {
  margin: 0;

  font-family:
    "Poppins",
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.auth-layout {
  min-height: 100vh;
}
</style>