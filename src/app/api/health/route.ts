import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        external: process.memoryUsage().external / 1024 / 1024,
        rss: process.memoryUsage().rss / 1024 / 1024,
      },
      features: {
        voiceOracle: process.env.NEXT_PUBLIC_ENABLE_VOICE_ORACLE === 'true',
        aiPredictions: process.env.NEXT_PUBLIC_ENABLE_AI_PREDICTIONS === 'true',
        premiumFeatures: process.env.NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES === 'true',
      },
      services: {
        convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
        clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        openai: !!process.env.OPENAI_API_KEY,
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  return new Response('', { status: 200 });
}