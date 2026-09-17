<template>
    <SettingDialog
        :open="settingDialog.isOpen"
        @scrim-click="() => settingDialog.toggle(false)"
    >


        <div>

        </div>

    </SettingDialog>
</template>

<script setup lang="ts">
import { useSettingDialog } from '@/stores/setting-dialog';
import SettingDialog from './SettingDialog.vue';

const settingDialog = useSettingDialog()

</script>

<style scoped></style>
