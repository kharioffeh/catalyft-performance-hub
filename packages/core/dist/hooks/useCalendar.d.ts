import { Session } from '../types/training';
export interface CalendarData {
    sessions: Session[];
    isLoading: boolean;
}
export interface UseCalendarProps {
    sessions?: Session[];
    isLoading?: boolean;
}
/**
 * Core calendar logic without React dependencies
 */
export declare const useCalendar: (props?: UseCalendarProps) => CalendarData;
