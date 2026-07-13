'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Play, Save, Copy, Code, Book, Zap, History } from 'lucide-react';

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: Parameter[];
  requestBody?: any;
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState('{\n  "key": "value"\n}');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const endpoints: ApiEndpoint[] = [
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      description: 'Get all users',
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number', defaultValue: '1' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page', defaultValue: '10' }
      ]
    },
    {
      id: '2',
      method: 'POST',
      path: '/api/users',
      description: 'Create a new user',
      parameters: [],
      requestBody: { name: 'string', email: 'string', role: 'string' }
    },
    {
      id: '3',
      method: 'PUT',
      path: '/api/users/:id',
      description: 'Update a user',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'User ID' }
      ],
      requestBody: { name: 'string', email: 'string' }
    },
    {
      id: '4',
      method: 'DELETE',
      path: '/api/users/:id',
      description: 'Delete a user',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'User ID' }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'PATCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSendRequest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'Request successful',
        timestamp: new Date().toISOString()
      }
    };

    setResponse(JSON.stringify(mockResponse, null, 2));
    
    setHistory([...history, {
      endpoint: selectedEndpoint,
      timestamp: new Date(),
      status: 200
    }].slice(0, 10));
    
    setIsLoading(false);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  const handleSaveRequest = () => {
    // Save request to collection
    console.log('Saving request...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap />
          API Playground
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Collection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Endpoints List */}
        <div className="border rounded-lg bg-background p-4">
          <h2 className="font-semibold mb-4">Endpoints</h2>
          <div className="space-y-2">
            {endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedEndpoint?.id === endpoint.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm">{endpoint.path}</span>
                </div>
                <p className="text-xs text-muted-foreground">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Request Builder */}
        <div className="col-span-2 space-y-4">
          {selectedEndpoint ? (
            <>
              <div className="border rounded-lg bg-background p-4">
                <h2 className="font-semibold mb-4">Request</h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded text-white ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <input
                    type="text"
                    value={selectedEndpoint.path}
                    className="flex-1 px-3 py-2 border rounded font-mono"
                    readOnly
                  />
                  <Button onClick={handleSendRequest} disabled={isLoading}>
                    {isLoading ? 'Sending...' : <><Play className="w-4 h-4 mr-2" /> Send</>}
                  </Button>
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Parameters</h3>
                    {selectedEndpoint.parameters.map(param => (
                      <div key={param.name} className="flex items-center gap-2 mb-2">
                        <span className="text-sm w-32">{param.name}</span>
                        <input
                          type="text"
                          defaultValue={param.defaultValue}
                          placeholder={param.type}
                          className="flex-1 px-3 py-1 border rounded text-sm"
                        />
                        {param.required && <span className="text-red-500 text-xs">required</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Request Body</h3>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full h-32 px-3 py-2 border rounded font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Response */}
              <div className="border rounded-lg bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Response</h2>
                  <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-64">
                  {response || 'No response yet'}
                </pre>
              </div>
            </>
          ) : (
            <div className="border rounded-lg bg-background p-8 text-center text-muted-foreground">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an endpoint to start testing</p>
            </div>
          )}
        </div>

        {/* Documentation & Info */}
        <div className="space-y-4">
          <div className="border rounded-lg bg-background p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Book />
              Documentation
            </h2>
            {selectedEndpoint ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                </div>
                <div>
                  <p className="font-medium">Parameters</p>
                  {selectedEndpoint.parameters.map(param => (
                    <div key={param.name} className="text-muted-foreground">
                      <span className="font-mono">{param.name}</span>: {param.type} {param.required && '(required)'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an endpoint to view documentation</p>
            )}
          </div>

          <div className="border rounded-lg bg-background p-4">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Copy as cURL
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Code className="w-4 h-4 mr-2" />
                Generate Code
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Save to Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
