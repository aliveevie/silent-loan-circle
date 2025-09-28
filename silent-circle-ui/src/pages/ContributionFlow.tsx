import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle, Lock } from "lucide-react";

export default function ContributionFlow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleProveAndContribute = async () => {
    setIsProcessing(true);
    
    // Simulate zk proof generation and contribution process
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "Contribution Successful!",
        description: "Your zero-knowledge proof has been verified and contribution recorded.",
      });
    }, 3000);
  };

  const handleReset = () => {
    setIsComplete(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {isComplete ? (
                <CheckCircle className="h-8 w-8 text-success" />
              ) : (
                <Shield className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isComplete ? "Contribution Complete" : "Prove & Contribute"}
            </CardTitle>
            <CardDescription>
              {isComplete
                ? "Your contribution has been verified and recorded privately on the blockchain"
                : "Generate zero-knowledge proof and submit your contribution to the circle"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isComplete && (
              <>
                {/* Contribution Details */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Contribution Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Circle:</span>
                      <p className="font-medium">Family Savings Circle</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-medium">100 MIDNIGHT</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cycle:</span>
                      <p className="font-medium">3 of 10</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Privacy:</span>
                      <p className="font-medium text-accent">Zero-Knowledge</p>
                    </div>
                  </div>
                </div>

                {/* Processing Steps */}
                {isProcessing && (
                  <div className="space-y-4 animate-fade-up">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                      <p className="text-lg font-semibold">Generating Proof...</p>
                      <p className="text-sm text-muted-foreground">
                        This may take a few moments to ensure complete privacy
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span>Validating contribution amount</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span>Generating zero-knowledge proof</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <span>Submitting to blockchain</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {isComplete && (
              <div className="text-center space-y-4 animate-scale-in">
                <div className="bg-success/10 rounded-lg p-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                  <h3 className="font-semibold text-success mb-2">Proof Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Your contribution has been privately recorded on the Midnight blockchain
                  </p>
                </div>
                
                <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Transaction Details:</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Proof Hash: zk_abc123...def789
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Block: #1,234,567 • Confirmed
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4">
              {!isComplete ? (
                <Button
                  onClick={handleProveAndContribute}
                  disabled={isProcessing}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Proof...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Prove & Contribute
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full"
                  >
                    Make Another Contribution
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}