import { GET as getFile } from '../route';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  const url = new URL(request.url);
  url.searchParams.set('download', '1');
  const modifiedReq = new Request(url.toString(), {
    method: 'GET',
    headers: request.headers
  });
  return getFile(modifiedReq, context);
}
