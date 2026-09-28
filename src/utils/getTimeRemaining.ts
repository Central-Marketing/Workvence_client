export function getTimeRemaining(deadline?: string | number | Date | null): string {
    if (!deadline) return '00D 00H 00S';
    const target = new Date(deadline).getTime();
    const diff = target - Date.now();

    if (isNaN(target) || diff <= 0) return '00D 00H 00S';

    const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

    return `${d}D ${h}H ${s}S`;
}