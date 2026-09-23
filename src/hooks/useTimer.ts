import { UseTimerResult } from '@/interfaces/interface';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useTimer Hook
 * @param initialSeconds Total duration for the countdown in seconds (default: 300 / 5 minutes)
 */
export const useTimer = (initialSeconds: number = 45): UseTimerResult => {
    const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Helper function to safely clear active intervals
    const clear = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Starts the countdown decrementing every 1 second
    const start = useCallback(() => {
        clear();
        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clear();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Resets the timer back to its initial value and restarts it
    const resetTimer = useCallback(() => {
        setSecondsLeft(initialSeconds);
        start();
    }, [initialSeconds, start]);

    // Forces the timer to stop and immediately jumps to 0
    const endTimer = useCallback(() => {
        clear();
        setSecondsLeft(0);
    }, []);

    // Start countdown automatically when the hook mounts
    useEffect(() => {
        start();
        return clear; // Cleanup on unmount
    }, [start]);

    // Helper: Formats numbers into MM:SS format (e.g. 65 seconds -> "01:05")
    const minutes = Math.floor(secondsLeft / 60);
    const remainderSeconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainderSeconds).padStart(2, '0')}`;

    return {
        secondsLeft,
        formattedTime,
        timerFinished: secondsLeft === 0,
        resetTimer,
        endTimer
    };
};