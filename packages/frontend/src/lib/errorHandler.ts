export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const handleApiError = (error: any) => {
  if (error.statusCode) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
        },
      },
    };
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
      },
    };
  }

  // Generic errors
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
  };
}; 