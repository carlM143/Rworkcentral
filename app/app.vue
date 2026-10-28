<script setup lang="ts">

const router =
  useRouter()

const isPageLoading =
  ref(true)

let hideTimer:
  ReturnType<
    typeof setTimeout
  > | undefined

let removeBeforeGuard:
  (() => void) | undefined

let removeAfterGuard:
  (() => void) | undefined

const showPageLoader = () => {
  if (hideTimer) {
    clearTimeout(
      hideTimer,
    )
  }

  isPageLoading.value =
    true
}

const hidePageLoader = (
  delay = 300,
) => {
  if (hideTimer) {
    clearTimeout(
      hideTimer,
    )
  }

  hideTimer =
    setTimeout(
      () => {
        isPageLoading.value =
          false
      },
      delay,
    )
}

onMounted(() => {

  hidePageLoader(500)

  removeBeforeGuard =
    router.beforeEach((to, from) => {
      if (to.path.startsWith('/employee') || from.path?.startsWith('/employee')) {
        return true
      }

      showPageLoader()
      return true
    })

  removeAfterGuard =
    router.afterEach((to) => {
      if (!to.path.startsWith('/employee')) {
        hidePageLoader(300)
      }
    })
})

onBeforeUnmount(() => {
  if (hideTimer) {
    clearTimeout(
      hideTimer,
    )
  }

  removeBeforeGuard?.()
  removeAfterGuard?.()
})
</script>

<template>
  <div class="root-app">

    <!-- =====================================================
         GLOBAL PAGE LOADER
    ====================================================== -->

    <Transition name="global-loader-fade">

      <div
        v-if="
          isPageLoading
        "
        class="global-page-loader"
      >

        <div class="loader-orbit">

          <div class="loader-logo">
            <img src="/icon.png" alt="RWorkCentral" class="loader-brand-image">
          </div>

        </div>

      </div>

    </Transition>

    <!-- =====================================================
         APPLICATION
    ====================================================== -->

    <NuxtLayout>

      <NuxtPage />

    </NuxtLayout>

  </div>
</template>

<style>
.root-app {
  min-height: 100vh;
}

/* =========================================================
   GLOBAL LOADING OVERLAY
========================================================= */

.global-page-loader {
  position: fixed;

  inset: 0;

  z-index: 999999;

  display: flex;

  align-items: center;
  justify-content: center;

  background:
    color-mix(
      in srgb,
      var(
        --bg-main,
        #0d1421
      )
      92%,
      transparent
    );

  backdrop-filter:
    blur(5px);

  -webkit-backdrop-filter:
    blur(5px);
}

/* =========================================================
   CIRCLE
========================================================= */

.loader-orbit {
  position: relative;

  display: flex;

  width: 78px;
  height: 78px;

  align-items: center;
  justify-content: center;
}

/* ROTATING OUTER RING */

.loader-orbit::before {
  position: absolute;

  inset: 0;

  border:
    3px solid
    rgba(
      36,
      107,
      253,
      0.15
    );

  border-top-color:
    #246bfd;

  border-right-color:
    #5f98ff;

  border-radius: 50%;

  content: '';

  animation:
    loader-spin
    0.75s
    linear
    infinite;
}

/* SUBTLE SECOND RING */

.loader-orbit::after {
  position: absolute;

  inset: 7px;

  border:
    1px solid
    rgba(
      36,
      107,
      253,
      0.12
    );

  border-radius: 50%;

  content: '';

  animation:
    loader-pulse
    1.2s
    ease-in-out
    infinite;
}

/* LOGO */

.loader-logo {
  position: relative;

  z-index: 2;

  display: flex;

  width: 54px;
  height: 54px;

  align-items: center;
  justify-content: center;

  overflow: hidden;

  border-radius: 12px;

  background: #ffffff;

  box-shadow:
    0 8px 30px
    rgba(
      36,
      107,
      253,
      0.28
    );

  animation:
    loader-logo-pulse
    1.15s
    ease-in-out
    infinite;
}

.loader-brand-image {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: contain;
}

/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes loader-spin {
  from {
    transform:
      rotate(0deg);
  }

  to {
    transform:
      rotate(360deg);
  }
}

@keyframes loader-pulse {
  0%,
  100% {
    opacity: 0.3;

    transform:
      scale(0.96);
  }

  50% {
    opacity: 0.8;

    transform:
      scale(1);
  }
}

@keyframes loader-logo-pulse {
  0%,
  100% {
    transform:
      scale(0.96);
  }

  50% {
    transform:
      scale(1);
  }
}

/* =========================================================
   FADE
========================================================= */

.global-loader-fade-enter-active,
.global-loader-fade-leave-active {
  transition:
    opacity 0.2s ease;
}

.global-loader-fade-enter-from,
.global-loader-fade-leave-to {
  opacity: 0;
}
</style>