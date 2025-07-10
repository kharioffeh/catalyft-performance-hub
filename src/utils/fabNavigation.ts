/**
 * Navigation utilities for FAB actions
 */

// For adding new workout sessions - opens create session dialog
export const createAddSessionHandler = (openCreateDialog: () => void) => () => {
  openCreateDialog();
};

// For adding new meals - opens meal scanner/add meal dialog  
export const createAddMealHandler = (openMealDialog: () => void) => () => {
  openMealDialog();
};

// Generic navigation handler
export const createNavigationHandler = (navigate: (path: string) => void, path: string) => () => {
  navigate(path);
};