// Silent Loan Circle Component
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type Observable } from 'rxjs';

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  UserPlus
} from 'lucide-react';
import { useToast } from './ui/use-toast';

import { 
  type SilentLoanCircleDerivedState, 
  type CircleConfiguration,
  type DeployedSilentLoanCircleAPI,
  CircleState 
} from '../api/common-types';
import { type CircleDeployment } from '../contexts/SilentLoanCircleManager';
import { useSilentLoanCircleContext } from '../hooks/useSilentLoanCircleContext';

/** The props required by the {@link SilentLoanCircle} component. */
export interface SilentLoanCircleProps {
  /** The observable loan circle deployment. */
  circleDeployment$?: Observable<CircleDeployment>;
}

/**
 * Provides the UI for a deployed Silent Loan Circle contract.
 */
export const SilentLoanCircle: React.FC<Readonly<SilentLoanCircleProps>> = ({ circleDeployment$ }) => {
  const circleApiProvider = useSilentLoanCircleContext();
  const [circleDeployment, setCircleDeployment] = useState<CircleDeployment>();
  const [deployedCircleAPI, setDeployedCircleAPI] = useState<DeployedSilentLoanCircleAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [circleState, setCircleState] = useState<SilentLoanCircleDerivedState>();
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [isWorking, setIsWorking] = useState(!!circleDeployment$);
  const [contractAddress, setContractAddress] = useState<string>('');
  const { toast } = useToast();

  // Callbacks for creating and joining circles
  const onCreateCircle = useCallback(() => {
    const config: CircleConfiguration = {
      maxMembers: 10,
      contributionAmount: 1000n,
      interestRate: 500n, // 5%
      cycleDurationBlocks: 1000n
    };
    circleApiProvider.resolve(undefined, config);
  }, [circleApiProvider]);

  const onJoinCircle = useCallback(
    (contractAddress: ContractAddress) => circleApiProvider.resolve(contractAddress),
    [circleApiProvider],
  );

  // Handle contribution submission
  const onContribute = useCallback(async () => {
    if (!contributionAmount || !deployedCircleAPI) {
      return;
    }

    try {
      setIsWorking(true);
      const amount = BigInt(contributionAmount);
      const result = await deployedCircleAPI.contributeToPool(amount);
      
      if (result.success) {
        toast({
          title: "Contribution Successful",
          description: `Successfully contributed ${contributionAmount} to the pool`,
        });
        setContributionAmount('');
      } else {
        throw new Error(result.error || 'Contribution failed');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      toast({
        title: "Contribution Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }, [deployedCircleAPI, contributionAmount, toast]);

  // Handle joining the circle
  const onJoinGroup = useCallback(async () => {
    if (!deployedCircleAPI) return;

    try {
      setIsWorking(true);
      const result = await deployedCircleAPI.joinGroup();
      
      if (result.success) {
        toast({
          title: "Joined Successfully",
          description: "You have successfully joined the Silent Loan Circle",
        });
      } else {
        throw new Error(result.error || 'Join failed');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      toast({
        title: "Join Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }, [deployedCircleAPI, toast]);

  // Handle payout request
  const onRequestPayout = useCallback(async () => {
    if (!deployedCircleAPI) return;

    try {
      setIsWorking(true);
      const result = await deployedCircleAPI.requestPayout();
      
      if (result.success) {
        toast({
          title: "Payout Requested",
          description: "Your payout request has been submitted",
        });
      } else {
        throw new Error(result.error || 'Payout request failed');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      toast({
        title: "Payout Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }, [deployedCircleAPI, toast]);

  // Effect to manage circle deployment subscription
  useEffect(() => {
    if (!circleDeployment$) return;

    const subscription = circleDeployment$.subscribe(setCircleDeployment);
    return () => subscription.unsubscribe();
  }, [circleDeployment$]);

  // Effect to manage deployed API and state subscription
  useEffect(() => {
    if (circleDeployment?.status === 'deployed') {
      setDeployedCircleAPI(circleDeployment.api);
      setErrorMessage(undefined);
      
      const subscription = circleDeployment.api.state$.subscribe(setCircleState);
      return () => subscription.unsubscribe();
    } else if (circleDeployment?.status === 'failed') {
      setErrorMessage(circleDeployment.error.message);
      setDeployedCircleAPI(undefined);
    }
  }, [circleDeployment]);

  // Handle join existing circle
  const handleJoinExisting = () => {
    if (contractAddress.trim()) {
      onJoinCircle(contractAddress.trim() as ContractAddress);
      setContractAddress('');
    }
  };

  // Render empty state for creating/joining circles
  if (!circleDeployment$) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Silent Loan Circle</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Create a new Silent Loan Circle or join an existing one to start participating in a privacy-preserving ROSCA.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Create New Circle</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start a new Silent Loan Circle with customizable parameters.
                  </p>
                  <Button onClick={onCreateCircle} className="w-full">
                    Create Circle
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Join Existing Circle</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter a contract address to join an existing circle.
                  </p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Contract Address"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                    />
                    <Button 
                      onClick={handleJoinExisting}
                      disabled={!contractAddress.trim()}
                      className="w-full"
                    >
                      Join Circle
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render loading state
  if (circleDeployment?.status === 'in-progress' || !circleState) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading Silent Loan Circle...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (errorMessage) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <span>Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render main circle interface
  const getStateColor = (state: CircleState) => {
    switch (state) {
      case CircleState.JOINING: return 'bg-blue-500';
      case CircleState.ACTIVE: return 'bg-green-500';
      case CircleState.COMPLETED: return 'bg-gray-500';
      case CircleState.DEFAULTED: return 'bg-red-500';
    }
  };

  const getStateName = (state: CircleState) => {
    switch (state) {
      case CircleState.JOINING: return 'Joining Phase';
      case CircleState.ACTIVE: return 'Active';
      case CircleState.COMPLETED: return 'Completed';
      case CircleState.DEFAULTED: return 'Defaulted';
    }
  };

  const memberProgress = (circleState.state.memberCount / circleState.state.maxMembers) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Silent Loan Circle</span>
          </CardTitle>
          <Badge className={getStateColor(circleState.state.circleState)}>
            {getStateName(circleState.state.circleState)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Contract: {deployedCircleAPI?.deployedContractAddress.slice(0, 10)}...
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Circle Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold">
                  {circleState.state.memberCount}/{circleState.state.maxMembers}
                </p>
              </div>
            </div>
            <Progress value={memberProgress} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contribution</p>
                <p className="text-2xl font-bold">{circleState.state.contributionAmount.toString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Cycle</p>
                <p className="text-2xl font-bold">{circleState.state.currentCycleIndex}</p>
              </div>
            </div>
          </Card>
        </div>

        <Separator />

        {/* Member Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {circleState.isMember ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <span>{circleState.isMember ? 'Member' : 'Not a member'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {circleState.hasContributed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <span>{circleState.hasContributed ? 'Contributed' : 'No contribution'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actions</h3>
          
          {!circleState.isMember && circleState.state.circleState === CircleState.JOINING && (
            <Button 
              onClick={onJoinGroup} 
              disabled={isWorking}
              className="w-full"
            >
              {isWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Join Circle
            </Button>
          )}

          {circleState.isMember && !circleState.hasContributed && (
            <div className="space-y-2">
              <Label htmlFor="contribution">Contribution Amount</Label>
              <div className="flex space-x-2">
                <Input
                  id="contribution"
                  type="number"
                  placeholder="Enter amount"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
                <Button 
                  onClick={onContribute}
                  disabled={isWorking || !contributionAmount}
                >
                  {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {circleState.canReceivePayout && (
            <Button 
              onClick={onRequestPayout}
              disabled={isWorking}
              className="w-full"
              variant="secondary"
            >
              {isWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <DollarSign className="h-4 w-4 mr-2" />}
              Request Payout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
