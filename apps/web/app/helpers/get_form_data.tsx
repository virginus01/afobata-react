import { NextRequest } from 'next/server';

export async function get_form_data(
  req: NextRequest,
): Promise<{ fields: Record<string, any>; files: null }> {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Check if the content type is appropriate for form data
    if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const formData = await req.formData();
      const fields: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          fields[key] = value;
        } else {
          // Handle file metadata without the file buffer
          fields[key] = {
            name: value.name,
            type: value.type,
            size: value.size,
          };
        }
      }

      return { fields, files: null };
    }

    // Handle JSON content type
    else if (contentType.includes('application/json')) {
      const body = await req.json();
      return { fields: body, files: null };
    }

    // Handle plain text or other content types
    else {
      const text = await req.text();

      // Try to parse as JSON if possible
      try {
        const parsed = JSON.parse(text);
        return { fields: parsed, files: null };
      } catch {
        // If not JSON, return as a single field
        return { fields: { body: text }, files: null };
      }
    }
  } catch (error) {
    console.error('Edge form parsing error:', error);

    // Additional error details for debugging
    const contentType = req.headers.get('content-type');
    console.error('Content-Type header:', contentType);
    console.error('Request method:', req.method);

    return { fields: {}, files: null };
  }
}
