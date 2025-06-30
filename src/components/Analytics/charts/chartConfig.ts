
import { chartTheme } from '@/lib/chartTheme';

export const chartConfig = {
  value: {
    label: "Value",
    color: chartTheme.colors.accent,
  },
  hrv: {
    label: "HRV",
    color: chartTheme.colors.info,
  },
  sleep: {
    label: "Sleep Quality",
    color: chartTheme.colors.positive,
  },
  deep: {
    label: "Deep",
    color: chartTheme.colors.info,
  },
  light: {
    label: "Light",
    color: chartTheme.colors.accent,
  },
  rem: {
    label: "REM",
    color: chartTheme.colors.positive,
  },
  acute: {
    label: "Acute",
    color: chartTheme.colors.warning,
  },
  chronic: {
    label: "Chronic",
    color: chartTheme.colors.info,
  },
};
