import type { ImportResponse } from '../types/crm';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * API client for interacting with the backend.
 */
export const api = {
  /**
   * Uploads a CSV file to the backend for AI-powered extraction.
   * @param file The selected CSV File object.
   * @returns A parsed ImportResponse on success.
   * @throws Descriptive error on non-200 responses or network failures.
   */
  importCsv: async (file: File): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to import CSV.';
        try {
          const errorData = await response.json();
          // Extract backend message if available
          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error; // Fallback to older error prop if some backend routes missed the update
          }
        } catch {
          errorMsg = `Unexpected server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data as ImportResponse;
    } catch (error: any) {
      // If it's already an error we manually threw above, re-throw it.
      // Otherwise, it's a network failure.
      if (error.message && error.message.includes('Unexpected server error') || error.message.includes('Failed to import') || error.message !== 'Failed to fetch') {
          throw new Error(error.message || 'Network error');
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
};
