
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheckStatus {
  envVars: 'pending' | 'pass' | 'fail';
  edgeFunctions: 'pending' | 'pass' | 'fail';
  realtime: 'pending' | 'pass' | 'fail';
  database: 'pending' | 'pass' | 'fail';
}

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthCheckStatus>({
    envVars: 'pending',
    edgeFunctions: 'pending', 
    realtime: 'pending',
    database: 'pending'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkEnvironmentVariables = () => {
    addLog('Checking environment variables...');
    
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length > 0) {
      addLog(`❌ Missing env vars: ${missing.join(', ')}`);
      setStatus(prev => ({ ...prev, envVars: 'fail' }));
      return false;
    }
    
    addLog('✅ All environment variables present');
    setStatus(prev => ({ ...prev, envVars: 'pass' }));
    return true;
  };

  const checkDatabase = async () => {
    addLog('Testing database connectivity...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (error) {
        addLog(`❌ Database error: ${error.message}`);
        setStatus(prev => ({ ...prev, database: 'fail' }));
        return false;
      }
      
      addLog('✅ Database connectivity working');
      setStatus(prev => ({ ...prev, database: 'pass' }));
      return true;
    } catch (error) {
      addLog(`❌ Database failed: ${error}`);
      setStatus(prev => ({ ...prev, database: 'fail' }));
      return false;
    }
  };

  const checkEdgeFunctions = async () => {
    addLog('Testing edge functions...');
    
    const functions = [
      'kai_generate_program',
      'aria_generate_insights',
      'velocity_aggregate'
    ];
    
    try {
      for (const functionName of functions) {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { test: true }
        });
        
        if (error && error.message.includes('404')) {
          addLog(`❌ Function ${functionName} not found`);
          setStatus(prev => ({ ...prev, edgeFunctions: 'fail' }));
          return false;
        }
        
        addLog(`✅ Function ${functionName} accessible`);
      }
      
      setStatus(prev => ({ ...prev, edgeFunctions: 'pass' }));
      return true;
    } catch (error) {
      addLog(`❌ Edge functions failed: ${error}`);
      setStatus(prev => ({ ...prev, edgeFunctions: 'fail' }));
      return false;
    }
  };

  const checkRealtimeConnectivity = async () => {
    addLog('Testing realtime connectivity...');
    
    return new Promise<boolean>((resolve) => {
      const channel = supabase.channel('health_check');
      let resolved = false;
      
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          addLog('❌ Realtime connectivity test timed out');
          setStatus(prev => ({ ...prev, realtime: 'fail' }));
          resolve(false);
        }
      }, 10000);
      
      channel
        .on('broadcast', { event: 'ping' }, (payload) => {
          if (!resolved && payload.payload?.message === 'pong') {
            resolved = true;
            addLog('✅ Realtime connectivity working');
            setStatus(prev => ({ ...prev, realtime: 'pass' }));
            resolve(true);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'ping', 
              payload: { message: 'ping' }
            });
          }
        });
    });
  };

  const runHealthCheck = async () => {
    setIsRunning(true);
    setLogs([]);
    setStatus({
      envVars: 'pending',
      edgeFunctions: 'pending',
      realtime: 'pending', 
      database: 'pending'
    });

    addLog('🏥 Starting environment health check...');

    const envCheck = checkEnvironmentVariables();
    const dbCheck = await checkDatabase();
    const functionsCheck = await checkEdgeFunctions();
    const realtimeCheck = await checkRealtimeConnectivity();

    const allPassed = envCheck && dbCheck && functionsCheck && realtimeCheck;
    
    addLog(allPassed ? '🎉 All health checks passed!' : '💥 Some health checks failed!');
    setIsRunning(false);
  };

  const getStatusIcon = (checkStatus: 'pending' | 'pass' | 'fail') => {
    switch (checkStatus) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (checkStatus: 'pending' | 'pass' | 'fail') => {
    switch (checkStatus) {
      case 'pass':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  useEffect(() => {
    // Auto-run health check on component mount
    runHealthCheck();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Environment Health Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runHealthCheck} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Health Check...' : 'Run Health Check'}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.envVars)}
                <span className="text-sm">Environment Variables</span>
              </div>
              {getStatusBadge(status.envVars)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <span className="text-sm">Database</span>
              </div>
              {getStatusBadge(status.database)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.edgeFunctions)}
                <span className="text-sm">Edge Functions</span>
              </div>
              {getStatusBadge(status.edgeFunctions)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.realtime)}
                <span className="text-sm">Realtime</span>
              </div>
              {getStatusBadge(status.realtime)}
            </div>
          </div>

          {logs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Logs:</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
