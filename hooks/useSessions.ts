import { Dispatch, SetStateAction } from 'react';
import useLocalStorage from './useLocalStorage';

const getInitialSessions = (): string[] => {
    return ['2024-2025', '2025-2026', '2026-2027'];
};

function useSessions(): [string[], Dispatch<SetStateAction<string[]>>] {
    const [sessions, setSessions] = useLocalStorage<string[]>('sessionsList', getInitialSessions);
    return [sessions, setSessions];
}

export default useSessions;