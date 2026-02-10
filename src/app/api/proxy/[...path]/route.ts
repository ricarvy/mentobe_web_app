import { NextRequest, NextResponse } from 'next/server';

/**
 * 后端 API 代理
 * 绕过 CORS 限制，将前端请求转发到后端服务
 */

// 优先使用服务端内部通信 URL，但仅当存在时。默认仍使用 NEXT_PUBLIC_BACKEND_URL (通常是域名)
// 注意：如果容器内无法解析域名，需要配置 hosts 或使用 INTERNAL_BACKEND_URL
const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // 构建后端 URL
    const path = params.path.join('/');
    const queryString = request.nextUrl.search;
    const backendUrl = `${BACKEND_URL}/${path}${queryString}`;

    console.log('[Backend Proxy]', {
      method,
      path,
      queryString,
      backendUrl,
      hasAuth: request.headers.has('authorization'),
    });

    // 获取请求体
    const body = method !== 'GET' ? await request.text() : undefined;

    // 转发请求到后端
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // 转发 Authorization header
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
        ...(request.headers.get('Authorization') && {
          'Authorization': request.headers.get('Authorization')!,
        }),
      },
      body,
      // 禁用缓存
      cache: 'no-store',
    });

    console.log('[Backend Proxy Response]', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    });

    // 如果是流式响应，直接返回 body stream
    if (response.headers.get('content-type')?.includes('text/event-stream') || 
        response.headers.get('transfer-encoding') === 'chunked' ||
        // AI 解读接口通常是流式的，即使 content-type 可能是 text/plain 或 application/json
        path.includes('interpret')) {
        
        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'application/json',
                // 确保 CORS 和缓存头正确
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }

    // 获取响应体
    const responseText = await response.text();

    // 转发响应
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Backend Proxy Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: '无法连接到后端服务',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
