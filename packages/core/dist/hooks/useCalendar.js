/**
 * Core calendar logic without React dependencies
 */
export const useCalendar = (props = {}) => {
    return {
        sessions: props.sessions || [],
        isLoading: props.isLoading || false
    };
};
