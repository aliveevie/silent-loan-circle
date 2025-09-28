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
  TrendingUp,
  Copy,
  X
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
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string>('');
  const [invitationHistory, setInvitationHistory] = useState<Array<{
    link: string;
    inviteeAddress: string;
    createdAt: string;
    token: string;
  }>>([]);

  // Load real circle data
  useEffect(() => {
    const loadCircleInfo = async () => {
      setIsLoading(true);
      
      try {
        // First, try to get from created circles in localStorage
        const savedCircles = localStorage.getItem('userCreatedCircles');
        let foundCircle = null;
        
        if (savedCircles) {
          const createdCircles = JSON.parse(savedCircles);
          foundCircle = createdCircles.find((circle: any) => circle.id === circleId);
        }
        
        // If not found in created circles, check available circles (mock data)
        if (!foundCircle) {
          const availableCircles = [
            {
              id: '1',
              name: 'Emergency Fund Circle',
              description: 'Build an emergency fund together with 10 members',
              contributionAmount: '100.00',
              currentMembers: 7,
              maxMembers: 10,
              cycleDuration: '30 days',
              status: 'active' as const
            },
            {
              id: '2',
              name: 'Vacation Savings Circle',
              description: 'Save for your dream vacation with friends',
              contributionAmount: '200.00',
              currentMembers: 4,
              maxMembers: 8,
              cycleDuration: '60 days',
              status: 'active' as const
            },
            {
              id: '3',
              name: 'Small Business Fund',
              description: 'Help entrepreneurs start their businesses',
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
          // Calculate total contributions based on current members and contribution amount
          const contributionPerMember = parseFloat(foundCircle.contributionAmount);
          const totalContributions = (foundCircle.currentMembers * contributionPerMember).toFixed(2);
          
          // Generate mock members based on current member count
          const members = [];
          for (let i = 0; i < foundCircle.currentMembers; i++) {
            members.push({
              address: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
              joinedDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
              totalContributed: contributionPerMember.toFixed(2),
              status: Math.random() > 0.8 ? 'pending' : 'active' as 'active' | 'pending'
            });
          }
          
          setCircleInfo({
            id: foundCircle.id,
            name: foundCircle.name,
            contributionAmount: foundCircle.contributionAmount,
            maxMembers: foundCircle.maxMembers,
            currentMembers: foundCircle.currentMembers,
            totalContributions,
            nextPayoutDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            cycleDuration: foundCircle.cycleDuration,
            status: foundCircle.status,
            members
          });
        } else {
          // Circle not found
          toast({
            title: "Circle Not Found",
            description: "The requested circle could not be found.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading circle info:', error);
        toast({
          title: "Error Loading Circle",
          description: "Failed to load circle information. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    if (circleId) {
      loadCircleInfo();
    }
  }, [circleId, navigate]);

  const handleInviteMember = async () => {
    if (!inviteAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address to invite.",
        variant: "destructive",
      });
      return;
    }

    if (!circleInfo) return;

    // Check if circle is full
    if (circleInfo.currentMembers >= circleInfo.maxMembers) {
      toast({
        title: "Circle Full",
        description: "This circle has reached its maximum member capacity.",
        variant: "destructive",
      });
      return;
    }

    // Check if address is already a member
    const isAlreadyMember = circleInfo.members.some(member => 
      member.address.toLowerCase() === inviteAddress.toLowerCase()
    );
    
    if (isAlreadyMember) {
      toast({
        title: "Already a Member",
        description: "This address is already a member of the circle.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      // Generate invitation token and link
      const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const baseUrl = 'https://silent-circle-loan.vercel.app';
      const invitationLink = `${baseUrl}/join/${circleInfo.id}?token=${invitationToken}&inviter=${address || 'unknown'}`;

      // Store the invitation in localStorage for validation
      const invitations = JSON.parse(localStorage.getItem('circleInvitations') || '{}');
      invitations[invitationToken] = {
        circleId: circleInfo.id,
        inviterAddress: address,
        inviteeAddress: inviteAddress,
        createdAt: Date.now(),
        status: 'pending'
      };
      localStorage.setItem('circleInvitations', JSON.stringify(invitations));

      // Simulate invitation process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store the generated link to display it
      setGeneratedInviteLink(invitationLink);

      // Add to invitation history
      const newInvitation = {
        link: invitationLink,
        inviteeAddress: inviteAddress,
        createdAt: new Date().toLocaleString(),
        token: invitationToken
      };
      setInvitationHistory(prev => [newInvitation, ...prev]);

      // Copy invitation link to clipboard
      try {
        await navigator.clipboard.writeText(invitationLink);
        toast({
          title: "🎉 Invitation Link Created!",
          description: "Link copied to clipboard! You can also copy it from the box below.",
        });
      } catch (clipboardError) {
        toast({
          title: "🎉 Invitation Link Created!",
          description: "Link generated successfully! Copy it from the box below.",
        });
      }

      setInviteAddress('');

    } catch (error: any) {
      console.error('Invitation failed:', error);
      toast({
        title: "❌ Failed to Create Invitation",
        description: error.message || "Failed to create invitation link. Please try again.",
        variant: "destructive",
      });
    } finally {
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

    if (!circleInfo) return;

    // Check if withdrawal amount exceeds available funds
    const availableFunds = parseFloat(circleInfo.totalContributions);
    const requestedAmount = parseFloat(withdrawAmount);
    
    if (requestedAmount > availableFunds) {
      toast({
        title: "Insufficient Funds",
        description: `Cannot withdraw ${withdrawAmount} DUST. Available: ${circleInfo.totalContributions} DUST`,
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
                Generate invitation links for new members to join your circle
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
                      Creating Invitation Link...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Generate Invitation Link
                    </>
                  )}
                </Button>

                {/* Display Generated Invitation Link */}
                {generatedInviteLink && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-green-800">🎉 Invitation Link Generated!</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedInviteLink);
                            toast({
                              title: "Copied!",
                              description: "Invitation link copied to clipboard.",
                            });
                          }}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setGeneratedInviteLink('')}
                          className="text-xs text-gray-500"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      Share this link with the person you want to invite:
                    </p>
                    <div className="bg-white border border-green-300 rounded p-3">
                      <code className="text-xs text-gray-800 break-all select-all">
                        {generatedInviteLink}
                      </code>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      💡 Tip: Click the link text to select all, then copy it manually if needed.
                    </p>
                  </div>
                )}

                {/* Invitation History */}
                {invitationHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Invitations</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {invitationHistory.slice(0, 5).map((invitation, index) => (
                        <div key={invitation.token} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-gray-600 truncate">
                              {invitation.inviteeAddress}
                            </p>
                            <p className="text-gray-500">{invitation.createdAt}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(invitation.link);
                              toast({
                                title: "Copied!",
                                description: "Invitation link copied to clipboard.",
                              });
                            }}
                            className="text-xs ml-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {invitationHistory.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing 5 most recent invitations
                      </p>
                    )}
                  </div>
                )}
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
