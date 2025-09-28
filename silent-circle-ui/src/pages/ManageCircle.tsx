import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSilentLoanCircleContext } from "@/hooks/useSilentLoanCircleContext";
import { 
  Loader2, 
  DollarSign, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Send,
  Download,
  UserPlus,
  Wallet,
  TrendingUp
} from "lucide-react";

interface CircleManagementInfo {
  id: string;
  name: string;
  contributionAmount: string;
  maxMembers: number;
  currentMembers: number;
  totalContributions: string;
  nextPayoutDate: string;
  cycleDuration: string;
  status: 'active' | 'pending' | 'completed';
  members: Array<{
    address: string;
    joinedDate: string;
    totalContributed: string;
    status: 'active' | 'pending';
  }>;
}

export default function ManageCircle() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const circleApiProvider = useSilentLoanCircleContext();
  
  const [circleInfo, setCircleInfo] = useState<CircleManagementInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteAddress, setInviteAddress] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock circle management data
  useEffect(() => {
    const loadCircleInfo = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCircleInfo({
          id: circleId || '1',
          name: 'Emergency Fund Circle',
          contributionAmount: '100.00',
          maxMembers: 10,
          currentMembers: 7,
          totalContributions: '2850.00',
          nextPayoutDate: '2025-02-15',
          cycleDuration: '30 days',
          status: 'active',
          members: [
            {
              address: '0x1234...5678',
              joinedDate: '2025-01-01',
              totalContributed: '400.00',
              status: 'active'
            },
            {
              address: '0x2345...6789',
              joinedDate: '2025-01-03',
              totalContributed: '300.00',
              status: 'active'
            },
            {
              address: '0x3456...7890',
              joinedDate: '2025-01-05',
              totalContributed: '450.00',
              status: 'active'
            },
            {
              address: '0x4567...8901',
              joinedDate: '2025-01-08',
              totalContributed: '250.00',
              status: 'pending'
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadCircleInfo();
  }, [circleId]);

  const handleInviteMember = async () => {
    if (!inviteAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address to invite.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      toast({
        title: "📧 Sending Invitation",
        description: `Sending invitation to ${inviteAddress}...`,
      });

      // Simulate invitation process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "🎉 Invitation Sent!",
        description: `Successfully invited ${inviteAddress} to join the circle.`,
      });

      setInviteAddress('');
      setIsInviting(false);

      // Add to pending members list
      if (circleInfo) {
        const newMember = {
          address: inviteAddress,
          joinedDate: new Date().toISOString().split('T')[0],
          totalContributed: '0.00',
          status: 'pending' as const
        };
        
        setCircleInfo({
          ...circleInfo,
          members: [...circleInfo.members, newMember]
        });
      }

    } catch (error: any) {
      console.error('Invitation failed:', error);
      toast({
        title: "❌ Invitation Failed",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      setIsInviting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      toast({
        title: "🏦 Processing Withdrawal",
        description: `Withdrawing ${withdrawAmount} DUST from the circle...`,
      });

      // Simulate withdrawal process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "✅ Withdrawal Successful!",
        description: `Successfully withdrew ${withdrawAmount} DUST from the circle.`,
      });

      setWithdrawAmount('');
      setIsWithdrawing(false);

      // Update total contributions
      if (circleInfo) {
        const newTotal = (parseFloat(circleInfo.totalContributions) - parseFloat(withdrawAmount)).toFixed(2);
        setCircleInfo({
          ...circleInfo,
          totalContributions: newTotal
        });
      }

    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast({
        title: "❌ Withdrawal Failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading circle management...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!circleInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Circle Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested circle could not be found.</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Circle Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{circleInfo.name}</CardTitle>
                <CardDescription>Manage your savings circle</CardDescription>
              </div>
              <Badge variant={circleInfo.status === 'active' ? 'default' : 'secondary'}>
                {circleInfo.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{circleInfo.currentMembers}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{circleInfo.totalContributions}</p>
                  <p className="text-sm text-muted-foreground">Total DUST</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{circleInfo.cycleDuration}</p>
                  <p className="text-sm text-muted-foreground">Cycle</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Circle Progress</span>
                <span>{circleInfo.currentMembers} / {circleInfo.maxMembers} members</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invite Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Invite Members
              </CardTitle>
              <CardDescription>
                Invite new members to join your savings circle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-address">Wallet Address</Label>
                  <Input
                    id="invite-address"
                    type="text"
                    value={inviteAddress}
                    onChange={(e) => setInviteAddress(e.target.value)}
                    placeholder="0x1234567890abcdef..."
                  />
                </div>
                
                <Button 
                  onClick={handleInviteMember}
                  disabled={isInviting || !inviteAddress.trim()}
                  className="w-full"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Withdraw Funds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Withdraw funds from the circle (only as allowed by circle rules)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (DUST)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {circleInfo.totalContributions} DUST
                  </p>
                </div>
                
                <Button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount}
                  className="w-full"
                  variant="outline"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Withdrawal...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Circle Members</CardTitle>
            <CardDescription>
              Current and pending members of your savings circle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {circleInfo.members.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{member.address}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {member.joinedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{member.totalContributed} DUST</p>
                      <p className="text-sm text-muted-foreground">Contributed</p>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
