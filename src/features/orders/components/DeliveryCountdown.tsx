import React, { useState, useEffect } from 'react';
import { getDeliveryTimeState, DeliveryTimeState } from '@/utils/getTimeRemaining';

interface CountdownPillProps {
    /** Target delivery date string, timestamp, or Date object */
    deliveryDate?: string | number | Date | null;
    className?: string;
    onOverdueChange?: (isOverdue: boolean) => void;
}

export const DeliveryCountdown: React.FC<CountdownPillProps> = ({
    deliveryDate,
    className = "",
    onOverdueChange,
}) => {
    const [timeState, setTimeState] = useState<DeliveryTimeState>(() =>
        getDeliveryTimeState(deliveryDate)
    );

    useEffect(() => {
        if (!deliveryDate) {
            setTimeState({
                isOverdue: false,
                timeLeftText: '00D 00H 00S',
                overdueText: '',
                formattedCountdown: '00D 00H 00S',
            });
            return;
        }

        const calculateTimeLeft = () => {
            const nextState = getDeliveryTimeState(deliveryDate);
            setTimeState(nextState);
            if (onOverdueChange) {
                onOverdueChange(nextState.isOverdue);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deliveryDate, onOverdueChange]);

    if (timeState.isOverdue) {
        return (
            <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border border-rose-200 bg-[#FFF1F2] text-rose-700 shadow-2xs inline-flex items-center tracking-wide ${className}`}>
                Late · {timeState.overdueText}
            </span>
        );
    }

    return (
        <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border border-[#B8DFDF] bg-white text-[#4600A9] shadow-2xs inline-flex items-center tracking-wide ${className}`}>
            {timeState.timeLeftText}
        </span>
    );
};