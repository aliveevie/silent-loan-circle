import { Observable } from 'rxjs';
export interface SilentLoanCircleProviders {
    privateStateProvider: any;
    publicDataProvider: any;
    zkConfigProvider: any;
    proofProvider: any;
    walletProvider: any;
    midnightProvider: any;
}
export interface SilentLoanCircleDerivedState {
    circleState: CircleState;
    memberCount: number;
    currentCycleIndex: number;
    payoutPointer: number;
    isMember: boolean;
    isAdmin: boolean;
    hasContributed: boolean;
}
export interface DeployedSilentLoanCircleContract {
    deployTxData: {
        public: {
            contractAddress: string;
        };
    };
}
export declare enum CircleState {
    JOINING = 0,
    ACTIVE = 1,
    COMPLETED = 2
}
export type PrivateStateId = string;
export declare const silentLoanCirclePrivateStateKey: PrivateStateId;
export interface SilentLoanCircleCircuitKeys {
    joinGroup: string;
    contributeToPool: string;
    executePayout: string;
    emergencyDefault: string;
    getGroupParams: string;
    getCurrentStatus: string;
}
export declare class SilentLoanCircleAPI {
    state$: Observable<SilentLoanCircleDerivedState>;
    deployedContract: DeployedSilentLoanCircleContract;
    deployedContractAddress: string;
    constructor(providers: SilentLoanCircleProviders, deployedContract: DeployedSilentLoanCircleContract);
    static deploy(providers: SilentLoanCircleProviders, logger: any): Promise<SilentLoanCircleAPI>;
    static join(providers: SilentLoanCircleProviders, contractAddress: string, logger: any): Promise<SilentLoanCircleAPI>;
    joinGroup(): Promise<void>;
    contributeToPool(amount: bigint): Promise<void>;
    executePayout(): Promise<void>;
    emergencyDefault(): Promise<void>;
    getGroupParams(): Promise<{
        contributionAmount: bigint;
        maxMembers: number;
        currentMembers: number;
    }>;
    getCurrentStatus(): Promise<{
        state: CircleState;
        cycle: number;
        payoutPointer: number;
    }>;
}
export declare const utils: {
    randomBytes: (length: number) => Uint8Array;
};
//# sourceMappingURL=index.d.ts.map