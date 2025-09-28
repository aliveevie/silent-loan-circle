import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSilentLoanCircleContext } from "@/hooks/useSilentLoanCircleContext";
import { Loader2, DollarSign, Users, Calendar, ArrowLeft, Shield } from "lucide-react";

interface CircleInfo {
  id: string;
  name: string;
  contributionAmount: string;
  totalContributions: number;
  maxMembers: number;
  currentMembers: number;
  cycleDuration: string;
  nextPayoutDate: string;
  status: 'active' | 'pending' | 'completed';
}

export default function ContributeToCircle() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { isConnected, connect, address } = useWallet();
  const circleApiProvider = useSilentLoanCircleContext();
  
  const [circleInfo, setCircleInfo] = useState<CircleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  // Mock circle data - in real app this would come from the contract
  useEffect(() => {
    const loadCircleInfo = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCircleInfo({
          id: circleId || '1',
          name: 'Emergency Fund Circle',
          contributionAmount: '100.00',
          totalContributions: 7,
          maxMembers: 10,
          currentMembers: 7,
          cycleDuration: '30 days',
          nextPayoutDate: '2025-02-15',
          status: 'active'
        });
        setContributionAmount('100.00'); // Set default contribution amount
        setIsLoading(false);
      }, 1000);
    };

    loadCircleInfo();
  }, [circleId]);

  const handleContribute = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Lace wallet to contribute to this circle.",
        variant: "destructive",
      });
      return;
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setIsContributing(true);

    try {
      // Create contribution transaction
      const contributionConfig = {
        circleId: circleInfo?.id,
        amount: contributionAmount,
        contributor: address,
        timestamp: Date.now()
      };

      toast({
        title: "🔄 Processing Contribution",
        description: "Your contribution is being processed...",
      });

      // Simulate smooth contribution process
      const contribution = circleApiProvider.resolve(circleInfo?.id, contributionConfig);
      
      contribution.subscribe({
        next: (deployment) => {
          if (deployment.status === 'deployed') {
            toast({
              title: "🎉 Contribution Successful!",
              description: `You've successfully contributed ${contributionAmount} DUST to ${circleInfo?.name}!`,
            });
            
            setIsContributing(false);
            
            // Navigate back to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else if (deployment.status === 'failed') {
            throw new Error(deployment.error?.message || 'Contribution failed');
          }
        },
        error: (error) => {
          console.error('Contribution failed:', error);
          toast({
            title: "❌ Contribution Failed",
            description: error.message || "Failed to process contribution. Please try again.",
            variant: "destructive",
          });
          setIsContributing(false);
        }
      });

    } catch (error: any) {
      console.error('Contribution error:', error);
      toast({
        title: "❌ Contribution Failed",
        description: error.message || "Failed to process contribution. Please try again.",
        variant: "destructive",
      });
      setIsContributing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading circle information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!circleInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Circle Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested savings circle could not be found.</p>
                <Button onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = (circleInfo.currentMembers / circleInfo.maxMembers) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Circle Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{circleInfo.name}</CardTitle>
                <CardDescription>Join this savings circle and start building your financial future</CardDescription>
              </div>
              <Badge variant={circleInfo.status === 'active' ? 'default' : 'secondary'}>
                {circleInfo.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Circle Stats */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Required Contribution</p>
                    <p className="font-semibold">{circleInfo.contributionAmount} DUST</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="font-semibold">{circleInfo.currentMembers} / {circleInfo.maxMembers}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cycle Duration</p>
                    <p className="font-semibold">{circleInfo.cycleDuration}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Circle Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="mt-2" />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">Next payout: {circleInfo.nextPayoutDate}</p>
                  <p>Total contributions: {circleInfo.totalContributions}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Make Your Contribution
            </CardTitle>
            <CardDescription>
              Contribute to join this savings circle. Your funds are secured by zero-knowledge proofs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Wallet Connection Status */}
              {!isConnected ? (
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-orange-900">Wallet Required</h3>
                      <p className="text-sm text-orange-700">Connect your Lace wallet to contribute</p>
                    </div>
                    <Button onClick={connect} variant="outline" size="sm">
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-600 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-medium text-green-900">Wallet Connected</h3>
                      <p className="text-sm text-green-700">Address: {address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contribution Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Contribution Amount (DUST)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter amount"
                  disabled={!isConnected}
                />
                <p className="text-sm text-muted-foreground">
                  Required: {circleInfo.contributionAmount} DUST
                </p>
              </div>

              {/* Security Notice */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">🔒 Zero-Knowledge Security</h3>
                <p className="text-sm text-blue-700">
                  Your contribution details are protected by zero-knowledge proofs. 
                  Only you and the circle members can see your participation.
                </p>
              </div>

              {/* Contribute Button */}
              <Button 
                onClick={handleContribute}
                disabled={!isConnected || isContributing || !contributionAmount}
                className="w-full"
                size="lg"
              >
                {isContributing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Contribution...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Contribute {contributionAmount} DUST
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
