import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, DollarSign, ArrowRight, Eye, EyeOff, Plus, ExternalLink } from "lucide-react";
import { SilentLoanCircle } from "@/components/SilentLoanCircle";
import { WalletTester } from "@/components/WalletTester";
import { useSilentLoanCircleContext } from "@/hooks/useSilentLoanCircleContext";
import { type Observable } from "rxjs";
import { type CircleDeployment } from "@/contexts/SilentLoanCircleManager";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showPrivateData, setShowPrivateData] = useState(false);
  const circleApiProvider = useSilentLoanCircleContext();
  const [circleDeployments, setCircleDeployments] = useState<Array<Observable<CircleDeployment>>>([]);
  
  // Mock available circles for users to join
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

  // Mock data - in real app this would come from blockchain
  const circleData = {
    name: "Family Savings Circle",
    currentCycle: 3,
    totalCycles: 10,
    contributionAmount: 100,
    poolTotal: showPrivateData ? 1000 : "***",
    nextPayoutDate: "2024-02-15",
    nextRecipient: "Alice Johnson",
    userStatus: "contributed" as const,
    timeRemaining: {
      days: 12,
      hours: 6,
      minutes: 42,
    },
  };

  const members = [
    { id: 1, name: "Alice Johnson", avatar: "", initials: "AJ", status: "contributed" as const, isNext: true },
    { id: 2, name: "Bob Smith", avatar: "", initials: "BS", status: "contributed" as const, isNext: false },
    { id: 3, name: "Carol Davis", avatar: "", initials: "CD", status: "pending" as const, isNext: false },
    { id: 4, name: "David Wilson", avatar: "", initials: "DW", status: "contributed" as const, isNext: false },
    { id: 5, name: "You", avatar: "", initials: "YU", status: "contributed" as const, isNext: false },
  ];

  // State for created circles with localStorage persistence
  const [createdCircles, setCreatedCircles] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('userCreatedCircles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Effect to subscribe to circle deployments
  useEffect(() => {
    const subscription = circleApiProvider.circleDeployments$.subscribe((deployments) => {
      setCircleDeployments(deployments);
      
      // Convert deployed circles to display format
      const newCreatedCircles: any[] = [];
      deployments.forEach((deployment, index) => {
        deployment.subscribe({
          next: (circle) => {
            if (circle.status === 'deployed' && circle.api) {
              const config = circle.api.configuration;
              const circleData = {
                id: circle.api.deployedContractAddress || `created-${Date.now()}-${index}`,
                name: config?.circleName || `My Circle #${index + 1}`,
                description: config?.description || 'Newly created savings circle',
                contributionAmount: config?.contributionAmount ? (Number(config.contributionAmount) / 1000000).toFixed(2) : '100.00',
                currentMembers: 1, // Starting with creator
                maxMembers: config?.maxMembers || 10,
                cycleDuration: config?.cycleDurationBlocks ? `${Math.round(Number(config.cycleDurationBlocks) / 144)} days` : '30 days', // Convert BigInt to Number first
                status: 'active' as const,
                isCreated: true // Flag to identify created circles
              };
              
              // Add to created circles if not already there
              setCreatedCircles(prev => {
                const exists = prev.some(c => c.id === circleData.id);
                if (!exists) {
                  const newCircles = [...prev, circleData];
                  // Save to localStorage for persistence
                  localStorage.setItem('userCreatedCircles', JSON.stringify(newCircles));
                  return newCircles;
                }
                return prev;
              });
            }
          }
        });
      });
    });
    
    return () => subscription.unsubscribe();
  }, [circleApiProvider]);

  const cycleProgress = (circleData.currentCycle / circleData.totalCycles) * 100;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Circle Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor your savings circle progress and contributions
          </p>
        </div>

        {/* Wallet Tester - Remove this after testing */}
        <div className="mb-8">
          <div className="flex justify-center">
            <WalletTester />
          </div>
        </div>

        {/* Available Circles to Join */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Circles & Available Circles</h2>
                    <p className="text-muted-foreground">
                      {createdCircles.length > 0 ? 
                        `You have ${createdCircles.length} circle${createdCircles.length === 1 ? '' : 's'}. Join more existing circles or create new ones.` :
                        'Join an existing savings circle or create your own'
                      }
                    </p>
                  </div>
            <Button onClick={() => navigate('/create')} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create New Circle
            </Button>
          </div>
          
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Show created circles first */}
                  {createdCircles.map((circle) => {
                    const progressPercentage = (circle.currentMembers / circle.maxMembers) * 100;

                    return (
                      <Card key={circle.id} className="hover:shadow-lg transition-shadow border-green-200 bg-green-50/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                              {circle.name}
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Created by You
                              </span>
                            </CardTitle>
                            <StatusBadge status={circle.status} />
                          </div>
                          <CardDescription className="text-sm">
                            {circle.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {circle.contributionAmount} DUST
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {circle.currentMembers}/{circle.maxMembers}
                              </span>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Members</span>
                                <span>{Math.round(progressPercentage)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {circle.cycleDuration} cycle
                            </div>

                            <div className="flex space-x-2 mt-4">
                              <Button
                                onClick={() => navigate(`/contribute/${circle.id}`)}
                                className="flex-1"
                                variant="outline"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                onClick={() => navigate(`/manage/${circle.id}`)}
                                className="flex-1"
                                variant="default"
                              >
                                Manage
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Show available circles */}
                  {availableCircles.map((circle) => {
              const progressPercentage = (circle.currentMembers / circle.maxMembers) * 100;
              
              return (
                <Card key={circle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{circle.name}</CardTitle>
                      <StatusBadge status={circle.status} />
                    </div>
                    <CardDescription className="text-sm">
                      {circle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {circle.contributionAmount} DUST
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {circle.currentMembers}/{circle.maxMembers}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Members</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {circle.cycleDuration} cycle
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          onClick={() => navigate(`/contribute/${circle.id}`)}
                          className="flex-1"
                          variant="outline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Circle
                        </Button>
                        <Button 
                          onClick={() => navigate(`/manage/${circle.id}`)}
                          className="flex-1"
                          variant="default"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Real Silent Loan Circle Components */}
        <div className="mb-8 space-y-6">
          {circleDeployments.map((circleDeployment, idx) => (
            <div key={`circle-${idx}`} data-testid={`circle-${idx}`}>
              <SilentLoanCircle circleDeployment$={circleDeployment} />
            </div>
          ))}
          <div data-testid="circle-start">
            <SilentLoanCircle />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Circle Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Circle Overview */}
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{circleData.name}</CardTitle>
                    <CardDescription>
                      Cycle {circleData.currentCycle} of {circleData.totalCycles}
                    </CardDescription>
                  </div>
                  <StatusBadge status={circleData.userStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{circleData.contributionAmount}</p>
                    <p className="text-sm text-muted-foreground">Contribution Amount</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{members.length}</p>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold">{circleData.poolTotal}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPrivateData(!showPrivateData)}
                        className="h-6 w-6 p-0"
                      >
                        {showPrivateData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Pool Total</p>
                  </div>
                </div>

                {/* Cycle Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Circle Progress</span>
                    <span>{Math.round(cycleProgress)}% Complete</span>
                  </div>
                  <Progress value={cycleProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Next Payout */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Next Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                    <p className="text-xl font-semibold">{circleData.nextRecipient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
                    <div className="flex gap-2 text-lg font-mono">
                      <span className="bg-primary/10 px-2 py-1 rounded text-primary">
                        {circleData.timeRemaining.days}d
                      </span>
                      <span className="bg-primary/10 px-2 py-1 rounded text-primary">
                        {circleData.timeRemaining.hours}h
                      </span>
                      <span className="bg-primary/10 px-2 py-1 rounded text-primary">
                        {circleData.timeRemaining.minutes}m
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Circle Members</CardTitle>
                <CardDescription>Current contribution status for all members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        member.isNext ? "bg-accent/10 border-accent/20" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.name}
                            {member.isNext && (
                              <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                                Next Recipient
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={member.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  View Contribution Flow
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full">
                  Circle Settings
                </Button>
                <Button variant="outline" className="w-full">
                  Invite Members
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="shadow-soft border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">Privacy Protected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your contributions are verified using zero-knowledge proofs. 
                  Only you can see your private financial data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}