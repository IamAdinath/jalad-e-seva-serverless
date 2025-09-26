export interface CognitoConfig {
  userPoolId: string;
  userPoolWebClientId: string;
  region: string;
  identityPoolId?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Environment variables for Cognito configuration
// These should be set during build time from CloudFormation outputs
const rawConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || '',
  region: import.meta.env.VITE_COGNITO_REGION || 'ap-south-1',
  identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
};

// Validate configuration
export const validateCognitoConfig = (): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  const required = [
    { key: 'userPoolId', value: rawConfig.userPoolId },
    { key: 'userPoolWebClientId', value: rawConfig.userPoolWebClientId },
    { key: 'region', value: rawConfig.region }
  ];
  
  for (const { key, value } of required) {
    if (!value || value.trim() === '') {
      errors.push(`Missing required Cognito configuration: ${key}`);
    }
  }
  
  // Validate format of User Pool ID
  if (rawConfig.userPoolId && !rawConfig.userPoolId.match(/^[a-z0-9-]+_[a-zA-Z0-9]+$/)) {
    errors.push('Invalid User Pool ID format. Expected format: region_poolId');
  }
  
  // Validate region format
  if (rawConfig.region && !rawConfig.region.match(/^[a-z0-9-]+$/)) {
    errors.push('Invalid AWS region format');
  }
  
  // Validate Client ID format (should be alphanumeric)
  if (rawConfig.userPoolWebClientId && !rawConfig.userPoolWebClientId.match(/^[a-zA-Z0-9]+$/)) {
    errors.push('Invalid User Pool Client ID format');
  }
  
  // Optional field warnings
  if (!rawConfig.identityPoolId) {
    warnings.push('Identity Pool ID not configured (optional)');
  }
  
  // Environment-specific validations
  if (isProduction && errors.length > 0) {
    errors.push('Production environment requires all Cognito configuration to be set');
  }
  
  if (isDevelopment && errors.length > 0) {
    warnings.push('Development environment detected with missing configuration');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Get validated configuration
export const getCognitoConfig = (): CognitoConfig => {
  const validation = validateCognitoConfig();
  
  // Log warnings in development
  if (isDevelopment && validation.warnings.length > 0) {
    console.warn('Cognito Configuration Warnings:', validation.warnings);
  }
  
  // Throw error if configuration is invalid
  if (!validation.isValid) {
    const errorMessage = `Invalid Cognito configuration:\n${validation.errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  return {
    userPoolId: rawConfig.userPoolId,
    userPoolWebClientId: rawConfig.userPoolWebClientId,
    region: rawConfig.region,
    identityPoolId: rawConfig.identityPoolId || undefined,
  };
};

// Export the configuration for direct access (use getCognitoConfig() for validation)
export const cognitoConfig = rawConfig;

// Configuration status check (for debugging)
export const getConfigStatus = () => {
  const validation = validateCognitoConfig();
  
  return {
    environment: isDevelopment ? 'development' : isProduction ? 'production' : 'unknown',
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    config: {
      userPoolId: rawConfig.userPoolId ? `${rawConfig.userPoolId.substring(0, 10)}...` : 'NOT_SET',
      userPoolWebClientId: rawConfig.userPoolWebClientId ? `${rawConfig.userPoolWebClientId.substring(0, 10)}...` : 'NOT_SET',
      region: rawConfig.region || 'NOT_SET',
      identityPoolId: rawConfig.identityPoolId ? `${rawConfig.identityPoolId.substring(0, 15)}...` : 'NOT_SET',
    }
  };
};