import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, DollarSign, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Dashboard() {
  const [showPrivateData, setShowPrivateData] = useState(false);

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