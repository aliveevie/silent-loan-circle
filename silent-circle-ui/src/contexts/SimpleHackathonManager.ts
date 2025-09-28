import { BehaviorSubject, Observable } from 'rxjs';
import { type Logger } from 'pino';

// Type declarations for Lace wallet
declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable(): Promise<{
          submitTransaction(tx: any): Promise<any>;
        }>;
      };
    };
  }
}

export interface CircleDeployment {
  status: 'in-progress' | 'failed' | 'deployed';
  api?: any;
  error?: Error;
}

export interface DeployedCircleAPIProvider {
  readonly circleDeployments$: Observable<Array<Observable<CircleDeployment>>>;
  readonly resolve: (contractAddress?: string, configuration?: any) => Observable<CircleDeployment>;
}

/**
 * Simple test version for debugging
 */
export class SimpleHackathonManager implements DeployedCircleAPIProvider {
  private deploymentsSubject: BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>;

  constructor(private logger: Logger) {
    console.log('🔧 Initializing SimpleHackathonManager...');
    this.deploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<CircleDeployment>>>([]);
    console.log('✅ SimpleHackathonManager initialized');
  }

  get circleDeployments$(): Observable<Array<Observable<CircleDeployment>>> {
    return this.deploymentsSubject;
  }

  resolve(contractAddress?: string, configuration?: any): Observable<CircleDeployment> {
    console.log('🚀 Resolving deployment...', { contractAddress, configuration });
    
    const deployment = new BehaviorSubject<CircleDeployment>({
      status: 'in-progress',
    });

    // Add to deployments
    const deployments = this.deploymentsSubject.value;
    deployments.push(deployment);
    this.deploymentsSubject.next(deployments);

    // Actually try to connect to wallet and show popup
    this.connectAndCreateTransaction(deployment, configuration);

    return deployment;
  }

  private async connectAndCreateTransaction(deployment: BehaviorSubject<CircleDeployment>, configuration: any) {
    try {
      console.log('🔗 Looking for Lace wallet...');
      
      // Check if Lace wallet is available
      if (!window.midnight?.mnLace) {
        throw new Error('Lace wallet not found. Please install the Midnight Lace extension.');
      }

      const connectorAPI = window.midnight.mnLace;
      console.log('✅ Found Lace wallet, enabling...');

      // Enable the wallet - this might show a popup
      const wallet = await connectorAPI.enable();
      console.log('🎉 Wallet enabled!');

      // Create a transaction object
      const transaction = {
        type: 'contract_deployment',
        contractName: 'SilentLoanCircle',
        description: `Deploy Silent Loan Circle with ${configuration?.maxMembers || 5} members`,
        parameters: configuration,
        fee: '1000000',
        timestamp: Date.now()
      };

      console.log('📱 Sending transaction to Lace wallet for approval...');

      // THIS SHOULD SHOW THE LACE WALLET POPUP
      const result = await wallet.submitTransaction(transaction);
      
      console.log('✅ Transaction approved by user!', result);

      // Success - mark as deployed
      deployment.next({
        status: 'deployed',
        api: {
          deployedContractAddress: `slc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        }
      });

    } catch (error: any) {
      console.error('❌ Wallet transaction failed:', error);
      
      deployment.next({
        status: 'failed',
        error: new Error(error.message || 'Failed to create transaction')
      });
    }
  }
}
