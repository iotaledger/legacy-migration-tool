import { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const showCameraScanner: Writable<boolean> = writable(false)
