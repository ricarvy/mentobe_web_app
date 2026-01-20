import { NextRequest, NextResponse } from 'next/server';

/**
 * 后端 API 代理
 * 绕过 CORS 限制，将前端请求转发到后端服务
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901';

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
    const backendUrl = `${BACKEND_URL}/${path}`;

    console.log('[Backend Proxy]', {
      method,
      path,
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
        ...(request.headers.has('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body,
    });

    console.log('[Backend Proxy Response]', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    });

    // 获取响应体
    const responseText = await response.text();

    // 转发响应
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        // 保留流式响应的相关头
        ...(response.headers.get('transfer-encoding') && {
          'Transfer-Encoding': response.headers.get('transfer-encoding')!,
        }),
        ...(response.headers.get('content-encoding') && {
          'Content-Encoding': response.headers.get('content-encoding')!,
        }),
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
