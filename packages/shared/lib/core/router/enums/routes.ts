export enum AppRoute {
    Welcome = 'welcome',
    Legal = 'legal',
    CrashReporting = 'crashReporting',
    Appearance = 'appearance',
    Profile = 'profile',
    Setup = 'setup',
    // TODO: ledger replace create
    Create = 'create',
    Secure = 'secure',
    Password = 'password',
    LedgerSetup = 'ledgerSetup',
    Protect = 'protect',
    Backup = 'backup',
    Import = 'import',
    Migrate = 'migrate',
    Balance = 'balance',
    Congratulations = 'congratulations',
    Dashboard = 'dashboard',
    Login = 'login',
}

export enum LedgerRoute {
    Connect = 'connect',
    RestoreFromLedger = 'restoreFromLedger',
    LegacyIntro = 'legacyIntro',
    InstallationGuide = 'installationGuide',
    GenerateAddress = 'generateAddress',
    SwitchApps = 'switchApps',
    AccountIndex = 'accountIndex',
}

export enum AccountRoute {
    Init = 'init',
    Manage = 'manage',
    Send = 'send',
    Receive = 'receive',
}

export enum DashboardRoute {
    Wallet = 'wallet',
    Settings = 'settings',
    Staking = 'staking',
    Governance = 'governance',
}

export enum SettingsRoute {
    Init = 'init',
    GeneralSettings = 'generalSettings',
    Security = 'security',
    AdvancedSettings = 'advancedSettings',
    HelpAndInfo = 'helpAndInfo',
}

export enum SettingsRouteNoProfile {
    Init = 'init',
    GeneralSettings = 'generalSettings',
    AdvancedSettings = 'advancedSettings',
    HelpAndInfo = 'helpAndInfo',
}

export enum GovernanceRoute {
    Init = 'init',
    EventDetails = 'eventDetails',
}

export enum GeneralSettings {
    Theme = 'theme',
    Language = 'language',
    Currency = 'currency',
    Notifications = 'notifications',
    NetworkStatus = 'networkStatus',
    ChangeProfileName = 'changeProfileName',
}

export enum GeneralSettingsNoProfile {
    Theme = 'theme',
    Language = 'language',
    Notifications = 'notifications',
}

export enum SecuritySettings {
    ExportStronghold = 'exportStronghold',
    AppLock = 'appLock',
    ChangePassword = 'changePassword',
    ChangePincode = 'changePincode',
    DeleteProfile = 'deleteProfile',
}

export enum AdvancedSettings {
    NetworkConfiguration = 'networkConfiguration',
    BalanceFinder = 'balanceFinder',
    HiddenAccounts = 'hiddenAccounts',
    ErrorLog = 'errorLog',
    CrashReporting = 'crashReporting',
    Diagnostics = 'diagnostics',
    MigrateLedgerIndex = 'migrateLedgerIndex',
}

export enum AdvancedSettingsNoProfile {
    ErrorLog = 'errorLog',
    Diagnostics = 'diagnostics',
}

export enum HelpAndInfo {
    Documentation = 'documentation',
    FAQ = 'faq',
    Discord = 'discord',
    ReportAnIssue = 'reportAnIssue',
}

export enum ExternalRoute {
    Documentation = 'https://wiki.iota.org/use/wallets/firefly/general',
    Discord = 'https://discord.iota.org',
    FAQ = 'https://wiki.iota.org/use/wallets/firefly/faq-and-troubleshooting',
    IssueReport = 'https://github.com/iotaledger/legacy-migration-tool/issues/new/choose',
}

export enum LoginRoute {
    Init = 'init',
    EnterPin = 'enterPin',
    UpdateStronghold = 'updateStronghold',
}

export enum BackupRoute {
    Init = 'init',
    RecoveryPhrase = 'recoveryPhrase',
    Verify = 'verify',
    Backup = 'backup',
}

export enum ImportRoute {
    Init = 'init',
    TextImport = 'textImport',
    FileImport = 'fileImport',
    BackupPassword = 'backupPassword',
    UpdateStronghold = 'updateStronghold',
    Success = 'Success',
}

export enum ProtectRoute {
    Init = 'init',
    Biometric = 'biometric',
    Pin = 'pin',
    RepeatPin = 'repeatPin',
}

export enum MigrateRoute {
    Init = 'init',
    TransferFragmentedFunds = 'transferFragmentedFunds',
    BundleMiningWarning = 'bundleMiningWarning',
    SecureSpentAddresses = 'secureSpentAddresses',
    SecuringSpentAddresses = 'securingSpentAddresses',
    SecurityCheckCompleted = 'securityCheckCompleted',
}
