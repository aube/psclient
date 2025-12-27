<script setup>

// import { useRouter, useRoute } from "vue-router"
// import { useGeneralStore } from '../stores/general'

// const generalStore = useGeneralStore()
// const route = useRoute()
// const router = useRouter()

// active = route.fullPath === linkPrefixe + link

const items = [{
  link: "#services",
  title: "Services",
}, {
  link: "#portfolio",
  title: "Portfolio",
}, {
  link: "#about",
  title: "About",
}, {
  link: "#team",
  title: "Team",
}, {
  link: "#contact",
  title: "Contact",
}]

</script>

<template>
  <nav
    id="mainNav"
    class="navbar navbar-expand-lg navbar-dark fixed-top navbar-shrink"
  >
    <div class="container">
      <a
        class="navbar-brand"
        href="#page-top"
      ><img
        alt="..."
        src="/image/navbar-logo.svg"
      ></a>
      <button
        aria-controls="navbarResponsive"
        aria-expanded="false"
        aria-label="Toggle navigation"
        class="navbar-toggler collapsed"
        data-bs-target="#navbarResponsive"
        data-bs-toggle="collapse"
        type="button"
      >
        <svg
          aria-hidden="true"
          class="svg-inline--fa fa-bars ms-1"
          data-fa-i2svg=""
          data-icon="bars"
          data-prefix="fas"
          focusable="false"
          role="img"
          viewBox="0 0 448 512"
          xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
          fill="currentColor"
        /></svg>
      </button>
      <div
        id="navbarResponsive"
        class="navbar-collapse collapse"
        style=""
      >
        <ul class="navbar-nav text-uppercase ms-auto py-4 py-lg-0">
          <li
            v-for="item in items"
            :key="item.link"
            class="nav-item"
          >
            <a
              class="nav-link"
              :href="item.link"
            >{{ item.title }}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
