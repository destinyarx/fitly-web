import { getGenerationQuota } from '@/features/try-on/server';
import { authenticationErrorResponse } from '@/lib/auth/require-user.server';

export async function GET() {
  try {
    return Response.json(await getGenerationQuota(), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return authenticationErrorResponse(error);
  }
}
