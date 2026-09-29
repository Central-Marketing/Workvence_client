export interface DeliveryTimeState {
    isOverdue: boolean;
    timeLeftText: string;
    overdueText: string;
    formattedCountdown: string;
}

export function getDeliveryTimeState(deadline?: string | number | Date | null): DeliveryTimeState {
    if (!deadline) {
        return {
            isOverdue: false,
            timeLeftText: "00D 00H 00S",
            overdueText: "",
            formattedCountdown: "00D 00H 00S",
        };
    }

    const target = new Date(deadline).getTime();
    if (isNaN(target)) {
        return {
            isOverdue: false,
            timeLeftText: "00D 00H 00S",
            overdueText: "",
            formattedCountdown: "00D 00H 00S",
        };
    }

    const diff = target - Date.now();

    if (diff > 0) {
        const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
        const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
        const formatted = `${d}D ${h}H ${s}S`;
        return {
            isOverdue: false,
            timeLeftText: formatted,
            overdueText: "",
            formattedCountdown: formatted,
        };
    }

    // Overdue elapsed time
    const elapsed = Math.abs(diff);
    const totalDays = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
    const totalMins = Math.floor((elapsed / (1000 * 60)) % 60);
    const totalSecs = Math.floor((elapsed / 1000) % 60);

    let overdueText = "";
    if (totalDays > 0) {
        overdueText = `${totalDays} ${totalDays === 1 ? "day" : "days"} ${totalHours}h overdue`;
    } else if (totalHours > 0) {
        overdueText = `${totalHours} ${totalHours === 1 ? "hour" : "hours"} ${totalMins}m overdue`;
    } else if (totalMins > 0) {
        overdueText = `${totalMins} ${totalMins === 1 ? "minute" : "minutes"} overdue`;
    } else {
        overdueText = `${totalSecs}s overdue`;
    }

    const d = String(totalDays).padStart(2, "0");
    const h = String(totalHours).padStart(2, "0");
    const s = String(totalSecs).padStart(2, "0");
    const formattedCountdown = `${d}D ${h}H ${s}S overdue`;

    return {
        isOverdue: true,
        timeLeftText: "00D 00H 00S",
        overdueText,
        formattedCountdown,
    };
}

export function getTimeRemaining(deadline?: string | number | Date | null): string {
    return getDeliveryTimeState(deadline).timeLeftText;
}