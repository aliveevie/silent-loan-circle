import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, ArrowLeft, Users, DollarSign, Calendar, Shield, Loader2 } from "lucide-react";
import { useSilentLoanCircleContext } from "@/hooks/useSilentLoanCircleContext";
import { useWallet } from "@/contexts/WalletContext";
import { type CircleConfiguration } from "@/api/common-types";

export default function CreateCircle() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    circleName: "",
    contributionAmount: "",
    cycleDuration: "",
    maxMembers: "",
    description: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const circleApiProvider = useSilentLoanCircleContext();
  const { isConnected, connect, address } = useWallet();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if wallet is connected first
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Midnight Lace wallet to create a circle.",
        variant: "destructive",
      });
      
      try {
        await connect();
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to wallet. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      // Create circle configuration from form data
      const configuration: CircleConfiguration = {
        maxMembers: parseInt(formData.maxMembers),
        contributionAmount: BigInt(parseInt(formData.contributionAmount) * 1000000), // Convert to smallest unit
        interestRate: 500n, // 5% default interest rate
        cycleDurationBlocks: getCycleDurationInBlocks(formData.cycleDuration),
      };

      toast({
        title: "Creating Circle...",
        description: "Please sign the transaction in your Midnight Lace wallet.",
      });

      // This will prompt the wallet to sign the transaction
      const circleDeployment = circleApiProvider.resolve(undefined, configuration);

      // Subscribe to the deployment to track progress
      circleDeployment.subscribe({
        next: (deployment) => {
          if (deployment.status === 'deployed') {
            toast({
              title: "Circle Created Successfully! 🎉",
              description: `${formData.circleName} has been deployed and is ready for members to join.`,
            });
            
            // Reset form and navigate to dashboard
            setFormData({
              circleName: "",
              contributionAmount: "",
              cycleDuration: "",
              maxMembers: "",
              description: "",
            });
            setStep(1);
            setIsCreating(false);
            
            // Navigate to dashboard to see the new circle
            navigate('/dashboard');
          } else if (deployment.status === 'failed') {
            throw new Error(deployment.error.message);
          }
        },
        error: (error) => {
          console.error('Circle creation failed:', error);
          toast({
            title: "Creation Failed",
            description: error.message || "Failed to create circle. Please try again.",
            variant: "destructive",
          });
          setIsCreating(false);
        }
      });

    } catch (error: any) {
      console.error('Circle creation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create circle. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  // Helper function to convert cycle duration to blocks
  const getCycleDurationInBlocks = (duration: string): bigint => {
    const blocksPerMinute = 10n; // Approximate blocks per minute on Midnight
    const minutesPerHour = 60n;
    const hoursPerDay = 24n;
    const daysPerWeek = 7n;
    
    switch (duration) {
      case 'weekly':
        return blocksPerMinute * minutesPerHour * hoursPerDay * daysPerWeek;
      case 'biweekly':
        return blocksPerMinute * minutesPerHour * hoursPerDay * daysPerWeek * 2n;
      case 'monthly':
        return blocksPerMinute * minutesPerHour * hoursPerDay * 30n;
      case 'quarterly':
        return blocksPerMinute * minutesPerHour * hoursPerDay * 90n;
      default:
        return 1000n; // Default to 1000 blocks
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.circleName.trim() !== "" && formData.description.trim() !== "";
      case 2:
        return formData.contributionAmount !== "" && formData.cycleDuration !== "";
      case 3:
        return formData.maxMembers !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Create New Circle</h1>
          <p className="text-lg text-muted-foreground">
            Set up your privacy-preserving savings circle in just a few steps
          </p>
          
          {/* Wallet Status */}
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Midnight Lace wallet required to create a circle. You'll be prompted to connect when ready.
              </p>
            </div>
          )}
          
          {isConnected && address && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><Shield className="h-5 w-5 text-primary" /> Circle Details</>}
              {step === 2 && <><DollarSign className="h-5 w-5 text-primary" /> Financial Settings</>}
              {step === 3 && <><Users className="h-5 w-5 text-primary" /> Member Configuration</>}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Give your circle a name and description"}
              {step === 2 && "Set contribution amount and cycle duration"}
              {step === 3 && "Configure member limits and review settings"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <div className="space-y-2">
                  <Label htmlFor="circleName">Circle Name *</Label>
                  <Input
                    id="circleName"
                    placeholder="e.g., Family Savings Circle"
                    value={formData.circleName}
                    onChange={(e) => handleInputChange("circleName", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your circle's purpose"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <div className="space-y-2">
                  <Label htmlFor="contributionAmount">Contribution Amount (MIDNIGHT) *</Label>
                  <Input
                    id="contributionAmount"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.contributionAmount}
                    onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycleDuration">Cycle Duration *</Label>
                  <Select onValueChange={(value) => handleInputChange("cycleDuration", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-up">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members *</Label>
                  <Select onValueChange={(value) => handleInputChange("maxMembers", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select max members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 members</SelectItem>
                      <SelectItem value="10">10 members</SelectItem>
                      <SelectItem value="15">15 members</SelectItem>
                      <SelectItem value="20">20 members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Circle Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{formData.circleName || "Not set"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contribution:</span>
                      <p className="font-medium">{formData.contributionAmount || "0"} MIDNIGHT</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{formData.cycleDuration || "Not set"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Members:</span>
                      <p className="font-medium">{formData.maxMembers || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isCreating}
                className="flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Circle...
                  </>
                ) : (
                  <>
                    Create Circle
                    <Shield className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}