<script setup lang="ts">
import { User } from '../../types/User.types';
import { useUserStore } from '../../stores/user';
import UserProfileForm from '../../entities/user/UserProfileForm.vue';
import UserLogoutForm from '../../entities/user/UserLogoutForm.vue';

const userStore = useUserStore()

const currentUser = userStore.currentUser() as User

const onSubmit = async (formData: User) => {
  await userStore.updateUser(formData)
}

const onLogout = async () => {
  userStore.logoutUser()
}
</script>

<template>
  <div
    class="px-3"
  >
    <Tabs
      scrollable
      value="0"
    >
      <TabList>
        <Tab value="0">
          Пользователь
        </Tab>
        <Tab value="1">
          Настройки
        </Tab>
        <Tab value="2">
          Выход
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <UserProfileForm
            class="gap-4 w-full sm:w-156"
            :user="currentUser"
            @submit="onSubmit"
          />
        </TabPanel>
        <TabPanel value="1">
          <p class="m-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </TabPanel>
        <TabPanel value="2">
          <UserLogoutForm
            class="gap-4 w-full sm:w-156"
            @submit="onLogout"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>