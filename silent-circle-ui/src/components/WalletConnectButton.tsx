import React from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Wallet, 
  WalletCards, 
  LogOut, 
  Copy,
  CheckCircle2
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from './ui/use-toast';

export function WalletConnectButton() {
  const { 
    isConnected, 
    isConnecting, 
    address, 
    error, 
    connect, 
    disconnect 
  } = useWallet();
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (error) {
    return (
      <Button 
        variant="destructive" 
        size="sm"
        onClick={connect}
        disabled={isConnecting}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Retry Connection
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        variant="primary" 
        size="sm"
        onClick={connect}
        disabled={isConnecting}
        className="transition-smooth"
      >
        {isConnecting ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="transition-smooth flex items-center space-x-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <WalletCards className="h-4 w-4" />
          <span className="hidden sm:inline">
            {address ? formatAddress(address) : 'Connected'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={handleCopyAddress}
          className="cursor-pointer"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={disconnect}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
