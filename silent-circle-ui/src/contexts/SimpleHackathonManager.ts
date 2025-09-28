import { BehaviorSubject, Observable } from 'rxjs';
import { type Logger } from 'pino';

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

    // Simulate successful deployment after a short delay
    setTimeout(() => {
      deployment.next({
        status: 'deployed',
        api: {
          deployedContractAddress: 'mock-contract-' + Date.now()
        }
      });
    }, 2000);

    return deployment;
  }
}
