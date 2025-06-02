import { writable } from 'svelte/store';

export const user = writable<{ userId: string; token: string; name?: string } | null>(null);