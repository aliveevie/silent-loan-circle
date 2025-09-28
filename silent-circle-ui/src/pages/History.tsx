import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp, Award, Shield } from "lucide-react";

export default function History() {
  const userStats = {
    totalContributions: 15,
    cyclesCompleted: 3,
    totalSaved: 1500,
    trustScore: 98,
  };

  const contributionHistory = [
    {
      id: 1,
      circle: "Family Savings Circle",
      amount: 100,
      date: "2024-01-15",
      status: "completed" as const,
      proofHash: "zk_abc123...def789",
    },
    {
      id: 2,
      circle: "Friends Circle",
      amount: 50,
      date: "2024-01-08",
      status: "completed" as const,
      proofHash: "zk_xyz789...abc123",
    },
    {
      id: 3,
      circle: "Family Savings Circle",
      amount: 100,
      date: "2024-01-01",
      status: "completed" as const,
      proofHash: "zk_def456...ghi012",
    },
  ];

  const completedCircles = [
    {
      id: 1,
      name: "Holiday Fund Circle",
      members: 8,
      totalAmount: 800,
      completedDate: "2023-12-20",
      myPosition: 3,
    },
    {
      id: 2,
      name: "Emergency Fund Circle",
      members: 5,
      totalAmount: 500,
      completedDate: "2023-11-15",
      myPosition: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contribution History</h1>
          <p className="text-lg text-muted-foreground">
            Track your savings journey and build your reputation
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Overview */}
          <div className="lg:col-span-3 mb-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">{userStats.totalContributions}</p>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-success mx-auto mb-3" />
                  <p className="text-2xl font-bold">{userStats.cyclesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Cycles Completed</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <p className="text-2xl font-bold">{userStats.totalSaved}</p>
                  <p className="text-sm text-muted-foreground">Total Saved (MIDNIGHT)</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-accent/20">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
                  <p className="text-2xl font-bold">{userStats.trustScore}%</p>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                  <StatusBadge status="trusted" className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Contributions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Contributions</CardTitle>
                <CardDescription>Your latest private contributions with zero-knowledge proofs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributionHistory.map((contribution, index) => (
                    <div key={contribution.id}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{contribution.circle}</p>
                          <p className="text-sm text-muted-foreground">
                            {contribution.amount} MIDNIGHT • {contribution.date}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Proof: {contribution.proofHash}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status="contributed" />
                        </div>
                      </div>
                      {index < contributionHistory.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Circles */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Completed Circles</CardTitle>
                <CardDescription>Circles you've successfully completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedCircles.map((circle, index) => (
                    <div key={circle.id}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{circle.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {circle.members} members • {circle.totalAmount} MIDNIGHT total
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed: {circle.completedDate} • Position #{circle.myPosition}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-success">✓</div>
                        </div>
                      </div>
                      {index < completedCircles.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust & Reputation */}
          <div className="space-y-6">
            <Card className="shadow-soft border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">Trust & Reputation</CardTitle>
                <CardDescription>Your standing in the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <StatusBadge status="trusted" className="mb-3" />
                  <p className="text-sm text-muted-foreground">
                    You have a stellar reputation with 100% contribution rate
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>On-time Contributions</span>
                    <span className="font-medium">15/15 (100%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Circles Completed</span>
                    <span className="font-medium">3/3 (100%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Member Since</span>
                    <span className="font-medium">Jan 2023</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-success/10 text-success text-xs">
                        ✓
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p>Contributed to Family Circle</p>
                      <p className="text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        ⭐
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p>Earned Trusted Contributor badge</p>
                      <p className="text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent/10 text-accent text-xs">
                        🎉
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p>Holiday Fund Circle completed</p>
                      <p className="text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}