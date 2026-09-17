<template>
    <md-icon
        aria-hidden="true"
        v-html="svg"
    ></md-icon>
</template>

<script setup lang="ts">
import addSvg from '@material-design-icons/svg/outlined/add.svg?raw'
import addTaskSvg from '@material-design-icons/svg/outlined/add_task.svg?raw'
import arrowDropDownSvg from '@material-design-icons/svg/outlined/arrow_drop_down.svg?raw'
import arrowRightSvg from '@material-design-icons/svg/outlined/arrow_right.svg?raw'
import changeHistorySvg from '@material-design-icons/svg/outlined/change_history.svg?raw'
import checkSvg from '@material-design-icons/svg/outlined/check.svg?raw'
import closeSvg from '@material-design-icons/svg/outlined/close.svg?raw'
import darkModeSvg from '@material-design-icons/svg/outlined/dark_mode.svg?raw'
import deleteSvg from '@material-design-icons/svg/outlined/delete.svg?raw'
import formatIndentDecreaseSvg from '@material-design-icons/svg/outlined/format_indent_decrease.svg?raw'
import gridViewSvg from '@material-design-icons/svg/outlined/grid_view.svg?raw'
import keyboardArrowDownSvg from '@material-design-icons/svg/outlined/keyboard_arrow_down.svg?raw'
import keyboardArrowRightSvg from '@material-design-icons/svg/outlined/keyboard_arrow_right.svg?raw'
import lightModeSvg from '@material-design-icons/svg/outlined/light_mode.svg?raw'
import menuSvg from '@material-design-icons/svg/outlined/menu.svg?raw'
import moreVertSvg from '@material-design-icons/svg/outlined/more_vert.svg?raw'
import notesSvg from '@material-design-icons/svg/outlined/notes.svg?raw'
import openInNewSvg from '@material-design-icons/svg/outlined/open_in_new.svg?raw'
import paletteSvg from '@material-design-icons/svg/outlined/palette.svg?raw'
import playlistAddSvg from '@material-design-icons/svg/outlined/playlist_add.svg?raw'
import removeSvg from '@material-design-icons/svg/outlined/remove.svg?raw'
import scheduleSvg from '@material-design-icons/svg/outlined/schedule.svg?raw'
import settingsSvg from '@material-design-icons/svg/outlined/settings.svg?raw'
import starSvg from '@material-design-icons/svg/outlined/star.svg?raw'
import starOutlineSvg from '@material-design-icons/svg/outlined/star_outline.svg?raw'
import subdirectoryArrowRightSvg from '@material-design-icons/svg/outlined/subdirectory_arrow_right.svg?raw'
import swapVertSvg from '@material-design-icons/svg/outlined/swap_vert.svg?raw'
import taskAltSvg from '@material-design-icons/svg/outlined/task_alt.svg?raw'
import { computed } from 'vue'

export type TIconName =
    | 'add'
    | 'add_task'
    | 'arrow_drop_down'
    | 'arrow_right'
    | 'change_history'
    | 'check'
    | 'close'
    | 'dark_mode'
    | 'delete'
    | 'format_indent_decrease'
    | 'grid_view'
    | 'keyboard_arrow_down'
    | 'keyboard_arrow_right'
    | 'light_mode'
    | 'menu'
    | 'more_vert'
    | 'notes'
    | 'open_in_new'
    | 'palette'
    | 'playlist_add'
    | 'remove'
    | 'schedule'
    | 'settings'
    | 'star'
    | 'star_outline'
    | 'subdirectory_arrow_right'
    | 'swap_vert'
    | 'task_alt'
    | ''

const props = defineProps<{
    name: TIconName | string
}>()

const ICON_SVGS: Record<string, string> = {
    'add': addSvg,
    'add_task': addTaskSvg,
    'arrow_drop_down': arrowDropDownSvg,
    'arrow_right': arrowRightSvg,
    'change_history': changeHistorySvg,
    'check': checkSvg,
    'close': closeSvg,
    'dark_mode': darkModeSvg,
    'delete': deleteSvg,
    'format_indent_decrease': formatIndentDecreaseSvg,
    'grid_view': gridViewSvg,
    'keyboard_arrow_down': keyboardArrowDownSvg,
    'keyboard_arrow_right': keyboardArrowRightSvg,
    'light_mode': lightModeSvg,
    'menu': menuSvg,
    'more_vert': moreVertSvg,
    'notes': notesSvg,
    'open_in_new': openInNewSvg,
    'palette': paletteSvg,
    'playlist_add': playlistAddSvg,
    'remove': removeSvg,
    'schedule': scheduleSvg,
    'settings': settingsSvg,
    'star': starSvg,
    'star_outline': starOutlineSvg,
    'subdirectory_arrow_right': subdirectoryArrowRightSvg,
    'swap_vert': swapVertSvg,
    'task_alt': taskAltSvg,
    '': '',
}

const svg = computed(() => ICON_SVGS[props.name] ?? '')
</script>
