// Validation utilities for SocialFlyAI API
import { NextRequest, NextResponse } from 'next/server';

export interface ValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function validateRequired(
  data: any,
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        field,
        message: `${field} is required`,
      });
    }
  }

  return errors;
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error.response) {
    // Axios error with response
    return NextResponse.json(
      {
        error: error.response.data?.error?.message || error.message,
        details: error.response.data,
      },
      { status: error.response.status || 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: error.message,
    },
    { status: 500 }
  );
}

export function successResponse(data: any, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    data,
  });
}

export function errorResponse(
  error: string,
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}
