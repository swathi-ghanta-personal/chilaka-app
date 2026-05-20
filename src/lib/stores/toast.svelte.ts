export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
}

let nextId = 0;

export const toastState = $state<{ items: ToastItem[] }>({ items: [] });

export function showToast(message: string, type: ToastType = 'success', duration = 3000): void {
	const id = ++nextId;
	toastState.items.push({ id, message, type });
	setTimeout(() => {
		dismissToast(id);
	}, duration);
}

export function dismissToast(id: number): void {
	const idx = toastState.items.findIndex((t) => t.id === id);
	if (idx !== -1) toastState.items.splice(idx, 1);
}
