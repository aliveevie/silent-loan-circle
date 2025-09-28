// Wallet Connection Tester Component
// This component helps test the Lace wallet integration

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';

export const WalletTester: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testWalletConnection = async () => {
    setIsConnecting(true);
    setStatus('connecting');
    setMessage('Checking for Lace wallet...');

    try {
      // Check if window.midnight.mnLace exists
      if (!window.midnight?.mnLace) {
        throw new Error('Lace wallet not found. Please install the extension.');
      }

      setMessage('Lace wallet found! Requesting connection...');
      
      // This should trigger the Lace wallet popup
      const walletAPI = await window.midnight.mnLace.enable();
      
      setMessage('Wallet connected successfully! ✅');
      setStatus('connected');
      
      console.log('🎉 Lace wallet connected:', walletAPI);
      
    } catch (error: any) {
      setMessage(`Connection failed: ${error.message}`);
      setStatus('error');
      console.error('❌ Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const testTransaction = async () => {
    if (!window.midnight?.mnLace) {
      setMessage('Please connect wallet first');
      return;
    }

    setMessage('🔐 Wallet will show transaction approval popup...');
    
    try {
      const walletAPI = await window.midnight.mnLace.enable();
      
      // Create a mock balanced transaction (this is what the wallet expects)
      const testTx = {
        serialize: () => new Uint8Array([1, 2, 3, 4]), // Mock serialized transaction
        networkId: 'testnet',
        type: 'test'
      };

      setMessage('📝 Sending transaction to Lace wallet...');
      
      // This should show the Lace wallet transaction approval popup
      const result = await walletAPI.submitTransaction(testTx);
      
      setMessage(`✅ Transaction approved and submitted! TX: ${result}`);
      console.log('🎉 Transaction result:', result);
      
    } catch (error: any) {
      if (error.message.includes('User rejected')) {
        setMessage('❌ Transaction rejected by user');
      } else {
        setMessage(`❌ Transaction failed: ${error.message}`);
      }
      console.error('Transaction error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Lace Wallet Tester</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testWalletConnection}
            disabled={isConnecting}
            className="w-full"
            variant={status === 'connected' ? 'secondary' : 'default'}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : status === 'connected' ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Connected
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Lace Wallet
              </>
            )}
          </Button>
          
          {status === 'connected' && (
            <Button 
              onClick={testTransaction}
              className="w-full"
              variant="outline"
            >
              🔐 Test Transaction
            </Button>
          )}
        </div>

        {message && (
          <Alert variant={status === 'error' ? 'destructive' : 'default'}>
            {status === 'error' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-muted-foreground">
          This component tests the Lace wallet integration. Make sure you have the Lace wallet extension installed.
        </div>
      </CardContent>
    </Card>
  );
};
