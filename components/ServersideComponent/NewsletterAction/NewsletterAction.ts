'use server';

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return { success: false, message: 'Invalid email' };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1MTQyMzEwNiwiZXhwIjoxNzUxNDUxOTA2fQ.weRqmiR7nYs6SSByACXeHAsRhfPbcHflp4W4TGq1GGs`, 
      },
      body: JSON.stringify({ email }),
    });

    const result = await res.json().catch(() => null); // safe parsing

    if (!res.ok) {
      return {
        success: false,
        message: result?.message || 'Failed to subscribe',
      };
    }

    return {
      success: true,
      message: result?.message || 'Subscribed successfully',
    };
  } catch {
    return { success: false, message: 'Something went wrong. Please try again later.' };
  }
}
