# AWS CDK Web Server Infrastructure

This project uses AWS Cloud Development Kit (CDK) to deploy a secure web server infrastructure with a properly configured VPC, subnets, security groups, and EC2 instance.

## Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=Architecture+Diagram)

The infrastructure includes:

- **VPC** with public and private subnets across 2 availability zones
- **Internet Gateway** for public internet access
- **NAT Gateway** for private subnet outbound connectivity
- **Security Groups** with least privilege access controls
- **EC2 Instance** running Amazon Linux 2023 with Apache web server
- **IAM Role** with SSM access for secure instance management

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Node.js](https://nodejs.org/) (>= 18.x)
- [AWS CDK](https://aws.amazon.com/cdk/) (>= 2.0.0)
- An existing EC2 key pair named `test1` in your AWS account

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/cdk-web-server.git
   cd cdk-web-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Deployment

1. Bootstrap your AWS environment (if you haven't already):
   ```bash
   npx cdk bootstrap aws://YOUR_ACCOUNT_NUMBER/YOUR_REGION
   ```

2. Deploy the stack:
   ```bash
   npx cdk deploy
   ```

3. Access your web server using the public IP address output from the deployment.

## Configuration

You can customize the deployment by modifying the following files:

- `bin/cdk.ts`: Entry point and environment configuration
- `lib/cdk-stack.ts`: Main infrastructure definition

### Environment Variables

- `AWS_ACCOUNT_ID`: Your AWS account ID
- `AWS_REGION`: AWS region to deploy to (defaults to us-east-1)

## Testing

Run the test suite:

```bash
npm test
```

The tests verify:
- VPC and subnet creation
- Security group rules
- EC2 instance configuration

## Security Best Practices

This project implements several security best practices:

1. **Least Privilege Access**: Security groups allow only necessary traffic
2. **SSH Restriction**: SSH access is limited to specific IP ranges
3. **SSM Integration**: EC2 instance can be managed via AWS Systems Manager
4. **Private Subnets**: Backend resources are placed in private subnets
5. **Latest AMI**: Uses the latest Amazon Linux 2023 AMI with security patches

## Cost Considerations

The resources deployed by this stack will incur AWS charges. Key cost components:

- EC2 t3.micro instance (~$8/month)
- NAT Gateway (~$32/month)
- Data transfer costs (variable)

Use the [AWS Pricing Calculator](https://calculator.aws.amazon.com) for a detailed estimate.

## Cleanup

To avoid incurring charges, delete the stack when not in use:

```bash
npx cdk destroy
```

## Project Structure

```
.
├── bin/
│   └── cdk.ts                  # CDK app entry point
├── lib/
│   └── cdk-stack.ts            # Main infrastructure stack
├── test/
│   └── cdk.test.ts             # Infrastructure tests
├── .gitignore                  # Git ignore file
├── jest.config.js              # Jest configuration
├── package.json                # Project dependencies
├── README.md                   # This file
└── tsconfig.json               # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Useful Commands

* `npm run build` - Compile TypeScript to JavaScript
* `npm run watch` - Watch for changes and compile
* `npm run test` - Run tests
* `npx cdk deploy` - Deploy this stack to your default AWS account/region
* `npx cdk diff` - Compare deployed stack with current state
* `npx cdk synth` - Emit the synthesized CloudFormation template
