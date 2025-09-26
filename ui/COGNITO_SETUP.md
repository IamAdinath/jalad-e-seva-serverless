# AWS Cognito Configuration Setup

This document explains how to configure AWS Cognito authentication for the admin system.

## Prerequisites

1. AWS CloudFormation stack deployed with Cognito resources
2. Admin user created in the Cognito User Pool
3. Admin user assigned to the 'admin' group

## Environment Variables

Create a `.env` file in the `ui/` directory with the following variables:

```bash
# Copy from .env.example and fill in the values from CloudFormation outputs

# Cognito User Pool ID (from CloudFormation output: CognitoUserPoolId)
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx

# Cognito User Pool Web Client ID (from CloudFormation output: CognitoUserPoolClientId)
VITE_COGNITO_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Region (from CloudFormation output: CognitoRegion)
VITE_COGNITO_REGION=ap-south-1

# Cognito Identity Pool ID (from CloudFormation output: CognitoIdentityPoolId) - Optional
VITE_COGNITO_IDENTITY_POOL_ID=ap-south-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Getting Configuration Values

### From AWS Console

1. Go to AWS Cognito in the AWS Console
2. Select "User pools"
3. Find your user pool (should be named like `jalad-dev-blog-user-pool`)
4. Copy the User Pool ID from the overview page
5. Go to "App integration" tab
6. Find your app client and copy the Client ID

### From CloudFormation

1. Go to CloudFormation in the AWS Console
2. Find your stack
3. Go to "Outputs" tab
4. Copy the values for:
   - `CognitoUserPoolId`
   - `CognitoUserPoolClientId`
   - `CognitoRegion`
   - `CognitoIdentityPoolId` (optional)

### Using AWS CLI

```bash
# Get stack outputs
aws cloudformation describe-stacks --stack-name your-stack-name --query 'Stacks[0].Outputs'

# Or get specific output
aws cloudformation describe-stacks --stack-name your-stack-name --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId`].OutputValue' --output text
```

## Creating Admin Users

### Using AWS Console

1. Go to AWS Cognito User Pools
2. Select your user pool
3. Go to "Users" tab
4. Click "Create user"
5. Fill in username, email, and temporary password
6. Set password to permanent if desired
7. Go to "Groups" tab
8. Select the "admin" group
9. Click "Add users to group"
10. Select your user and add them

### Using AWS CLI

```bash
# Create user
aws cognito-idp admin-create-user \
  --user-pool-id your-user-pool-id \
  --username admin \
  --user-attributes Name=email,Value=admin@example.com \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id your-user-pool-id \
  --username admin \
  --password YourSecurePassword123! \
  --permanent

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id your-user-pool-id \
  --username admin \
  --group-name admin
```

## Troubleshooting

### Configuration Validation

The app includes built-in configuration validation. Check the browser console for detailed error messages if authentication isn't working.

You can also check configuration status by running this in the browser console:

```javascript
// Import the config checker (if available in dev tools)
import { getConfigStatus } from './src/config/cognito.ts';
console.log(getConfigStatus());
```

### Common Issues

1. **"Invalid Cognito configuration" error**
   - Check that all required environment variables are set
   - Verify the format of User Pool ID and Client ID
   - Ensure the region matches your AWS region

2. **"Access denied" error**
   - Verify the user is in the 'admin' group
   - Check that the group name is exactly 'admin' (case-sensitive)

3. **"User not found" error**
   - Verify the username/email exists in the User Pool
   - Check if the user account is enabled

4. **Network errors**
   - Verify the region is correct
   - Check if there are any CORS issues
   - Ensure the User Pool Client is configured correctly

### Development vs Production

- **Development**: The app will show warnings for missing optional configuration
- **Production**: All required configuration must be present or the app will fail to start

## Security Notes

1. Never commit `.env` files to version control
2. Use different User Pools for different environments
3. Regularly rotate User Pool Client secrets if using them
4. Monitor Cognito logs for suspicious activity
5. Use strong passwords for admin accounts
6. Enable MFA for admin accounts (recommended)

## Testing Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/admin/login`
3. Enter your admin credentials
4. You should be redirected to the admin dashboard
5. Check the browser console for any configuration warnings

If authentication fails, check the browser console and network tab for detailed error information.