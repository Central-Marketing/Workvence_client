import React, { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/utils/getTimeRemaining';

interface CountdownPillProps {
    /** Target delivery date string, timestamp, or Date object */
    deliveryDate?: string | number | Date | null;
    className?: string;
}

export const DeliveryCountdown: React.FC<CountdownPillProps> = ({ deliveryDate, className = "" }) => {
    const [timeLeft, setTimeLeft] = useState<string>(() =>
        deliveryDate ? getTimeRemaining(deliveryDate) : '00D 00H 00S'
    );

    useEffect(() => {
        if (!deliveryDate) {
            setTimeLeft('00D 00H 00S');
            return;
        }

        const calculateTimeLeft = () => {
            setTimeLeft(getTimeRemaining(deliveryDate));
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deliveryDate]);

    return (
        <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border border-[#B8DFDF] bg-white text-[#4600A9] shadow-2xs inline-flex items-center tracking-wide ${className}`}>
            {timeLeft}
        </span>
    );
};