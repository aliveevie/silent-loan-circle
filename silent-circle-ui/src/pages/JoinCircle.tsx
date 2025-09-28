import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSilentLoanCircleContext } from "@/hooks/useSilentLoanCircleContext";
import { 
  Loader2, 
  DollarSign, 
  Users, 
  Calendar, 
  Shield, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

interface InvitationInfo {
  circleId: string;
  circleName: string;
  contributionAmount: string;
  maxMembers: number;
  currentMembers: number;
  cycleDuration: string;
  inviterAddress: string;
  invitationToken: string;
  status: 'active' | 'full' | 'expired';
}

export default function JoinCircle() {
  const { circleId } = useParams<{ circleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isConnected, address, connectWallet } = useWallet();
  const circleApiProvider = useSilentLoanCircleContext();
  
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const invitationToken = searchParams.get('token');
  const inviterAddress = searchParams.get('inviter');

  useEffect(() => {
    const loadInvitationInfo = async () => {
      setIsLoading(true);
      
      try {
        if (!circleId || !invitationToken || !inviterAddress) {
          toast({
            title: "Invalid Invitation",
            description: "This invitation link is invalid or incomplete.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        // Load circle information
        let foundCircle = null;
        
        // Check created circles first
        const savedCircles = localStorage.getItem('userCreatedCircles');
        if (savedCircles) {
          const createdCircles = JSON.parse(savedCircles);
          foundCircle = createdCircles.find((circle: any) => circle.id === circleId);
        }
        
        // Check available circles if not found
        if (!foundCircle) {
          const availableCircles = [
            {
              id: '1',
              name: 'Emergency Fund Circle',
              contributionAmount: '100.00',
              currentMembers: 7,
              maxMembers: 10,
              cycleDuration: '30 days',
              status: 'active' as const
            },
            {
              id: '2',
              name: 'Vacation Savings Circle',
              contributionAmount: '200.00',
              currentMembers: 4,
              maxMembers: 8,
              cycleDuration: '60 days',
              status: 'active' as const
            },
            {
              id: '3',
              name: 'Small Business Fund',
              contributionAmount: '500.00',
              currentMembers: 2,
              maxMembers: 6,
              cycleDuration: '90 days',
              status: 'active' as const
            }
          ];
          
          foundCircle = availableCircles.find(circle => circle.id === circleId);
        }

        if (foundCircle) {
          // Check if circle is full
          const status = foundCircle.currentMembers >= foundCircle.maxMembers ? 'full' : 'active';
          
          setInvitationInfo({
            circleId: foundCircle.id,
            circleName: foundCircle.name,
            contributionAmount: foundCircle.contributionAmount,
            maxMembers: foundCircle.maxMembers,
            currentMembers: foundCircle.currentMembers,
            cycleDuration: foundCircle.cycleDuration,
            inviterAddress,
            invitationToken,
            status
          });
        } else {
          toast({
            title: "Circle Not Found",
            description: "The circle you were invited to could not be found.",
            variant: "destructive",
          });
          navigate('/dashboard');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading invitation:', error);
        toast({
          title: "Error Loading Invitation",
          description: "Failed to load invitation details. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadInvitationInfo();
  }, [circleId, invitationToken, inviterAddress, navigate]);

  const handleJoinCircle = async () => {
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to wallet. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!invitationInfo) return;

    if (invitationInfo.status === 'full') {
      toast({
        title: "Circle Full",
        description: "This circle has reached its maximum capacity.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      toast({
        title: "🔄 Joining Circle",
        description: `Contributing ${invitationInfo.contributionAmount} DUST to join ${invitationInfo.circleName}...`,
      });

      // Simulate joining process
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Update circle member count in localStorage if it's a created circle
      const savedCircles = localStorage.getItem('userCreatedCircles');
      if (savedCircles) {
        const createdCircles = JSON.parse(savedCircles);
        const circleIndex = createdCircles.findIndex((circle: any) => circle.id === invitationInfo.circleId);
        if (circleIndex !== -1) {
          createdCircles[circleIndex] = {
            ...createdCircles[circleIndex],
            currentMembers: createdCircles[circleIndex].currentMembers + 1
          };
          localStorage.setItem('userCreatedCircles', JSON.stringify(createdCircles));
        }
      }

      // Store that this user has joined this circle
      const joinedCircles = JSON.parse(localStorage.getItem('joinedCircles') || '[]');
      if (!joinedCircles.includes(invitationInfo.circleId)) {
        joinedCircles.push(invitationInfo.circleId);
        localStorage.setItem('joinedCircles', JSON.stringify(joinedCircles));
      }

      setHasJoined(true);
      
      toast({
        title: "🎉 Successfully Joined!",
        description: `You've joined ${invitationInfo.circleName} and contributed ${invitationInfo.contributionAmount} DUST!`,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Join failed:', error);
      toast({
        title: "❌ Failed to Join",
        description: error.message || "Failed to join circle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitationInfo) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (invitationInfo.currentMembers / invitationInfo.maxMembers) * 100;

  if (hasJoined) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to the Circle!</h2>
            <p className="text-muted-foreground mb-4">
              You've successfully joined {invitationInfo.circleName} and contributed {invitationInfo.contributionAmount} DUST.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription>
              You've been invited to join a Silent Loan Circle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Circle Information */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{invitationInfo.circleName}</h3>
                <Badge variant={invitationInfo.status === 'active' ? 'default' : 'destructive'}>
                  {invitationInfo.status === 'full' ? 'Full' : 'Active'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-semibold">{invitationInfo.contributionAmount} DUST</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contribution Required</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="font-semibold">{invitationInfo.cycleDuration}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Cycle Duration</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Members</span>
                  <span>{invitationInfo.currentMembers}/{invitationInfo.maxMembers}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            {/* Inviter Information */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Invited by:</p>
              <p className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                {invitationInfo.inviterAddress}
              </p>
            </div>

            {/* Wallet Connection Status */}
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Connect your Lace wallet to join this circle
                  </p>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Wallet Connected</p>
                    <p className="font-mono text-xs">{address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Join Button */}
            <div className="space-y-4">
              <Button 
                onClick={handleJoinCircle}
                disabled={isJoining || invitationInfo.status === 'full'}
                className="w-full"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Circle...
                  </>
                ) : invitationInfo.status === 'full' ? (
                  'Circle Full'
                ) : (
                  `Join Circle & Contribute ${invitationInfo.contributionAmount} DUST`
                )}
              </Button>

              {invitationInfo.status === 'active' && (
                <p className="text-xs text-center text-muted-foreground">
                  By joining, you agree to contribute {invitationInfo.contributionAmount} DUST to the circle pool.
                  This transaction will be processed through your connected Lace wallet.
                </p>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Zero-Knowledge Privacy</p>
                  <p>
                    Your contributions and identity are protected by zero-knowledge proofs. 
                    Only necessary transaction details are revealed to verify your participation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
