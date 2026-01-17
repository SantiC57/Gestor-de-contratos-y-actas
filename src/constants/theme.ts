export const COLORS = {
  primary: {
    green: '#1b6b2f',
    darkGreen: '#0d4620',
    lightGreen: '#2d8a47',
  },
  accent: {
    yellow: '#f4c430',
    darkYellow: '#d4a000',
  },
  neutral: {
    white: '#ffffff',
    darkGray: '#1f2937',
    mediumGray: '#6b7280',
    lightGray: '#f3f4f6',
    borderGray: '#e5e7eb',
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
} as const;

export const BUTTON_STYLES = {
  primary: `bg-[${COLORS.primary.green}] text-white hover:bg-[${COLORS.primary.darkGreen}] transition-colors`,
  secondary: `bg-white text-[${COLORS.primary.green}] border-2 border-[${COLORS.primary.green}] hover:bg-[${COLORS.primary.green}] hover:text-white transition-all`,
  success: `bg-[${COLORS.status.success}] text-white hover:bg-green-600 transition-colors`,
  danger: `bg-[${COLORS.status.error}] text-white hover:bg-red-700 transition-colors`,
} as const;
