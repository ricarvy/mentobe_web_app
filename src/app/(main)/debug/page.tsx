'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'failed';
  duration: number;
  data?: Record<string, unknown>;
  error?: string;
}

interface DebugTestResponse {
  timestamp: string;
  tests: TestResult[];
  totalDuration: number;
  summary: {
    totalTests: number;
    successCount: number;
    failedCount: number;
  };
}

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<DebugTestResponse | null>(null);
  const [configData, setConfigData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (skipLLM = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/debug/interpret-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user-id', skipLLM }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Test failed');
      }

      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/debug/config');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load config');
      }

      const data = await response.json();
      setConfigData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Dashboard</h1>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={loadConfig} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Load Config
          </Button>
          <Button onClick={() => runTest(true)} disabled={loading} variant="outline">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Test (Skip LLM)
          </Button>
          <Button onClick={() => runTest(false)} disabled={loading} variant="outline">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Full Test
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <XCircle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {testResults && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Total Duration: {testResults.totalDuration}ms | Success: {testResults.summary.successCount} / {testResults.summary.totalTests}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.tests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {test.status === 'success' ? (
                          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="mr-2 h-5 w-5 text-red-500" />
                        )}
                        <span className="font-semibold">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{test.duration}ms</span>
                    </div>
                    {test.status === 'success' && test.data && (
                      <div className="mt-2 bg-gray-900 rounded p-2 overflow-x-auto">
                        <pre className="text-xs text-green-400">{JSON.stringify(test.data, null, 2)}</pre>
                      </div>
                    )}
                    {test.status === 'failed' && test.error && (
                      <div className="mt-2 bg-red-900/20 rounded p-2">
                        <p className="text-sm text-red-500">{test.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Config Data */}
        {configData && (
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Current environment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Environment</h3>
                  <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300">{JSON.stringify(configData.environment, null, 2)}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">LLM Config</h3>
                  <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300">{JSON.stringify(configData.llm, null, 2)}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">App Config</h3>
                  <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300">{JSON.stringify(configData.app, null, 2)}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Demo Account</h3>
                  <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300">{JSON.stringify(configData.demoAccount, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
