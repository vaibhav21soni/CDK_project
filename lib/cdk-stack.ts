import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack, Tags } from 'aws-cdk-lib';

/**
 * Infrastructure stack that creates a VPC with public and private subnets,
 * and deploys an EC2 instance with appropriate security configurations.
 */
export class CdkStack extends cdk.Stack {
  // Public properties to expose resources
  public readonly vpc: ec2.Vpc;
  public readonly instance: ec2.Instance;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use higher-level VPC construct with proper subnet configuration
    this.vpc = new ec2.Vpc(this, 'MainVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        }
      ],
      natGateways: 1,
    });
    
    Tags.of(this.vpc).add('Name', `${id}-vpc`);
    Tags.of(this.vpc).add('Environment', 'Development');

    // Create security group with restricted SSH access
    this.securityGroup = new ec2.SecurityGroup(this, 'WebServerSG', {
      vpc: this.vpc,
      description: 'Allow HTTP and restricted SSH access',
      allowAllOutbound: true,
    });
    
    // Allow HTTP from anywhere
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP access from anywhere'
    );
    
    // For SSH, you should restrict to your IP address or VPN range
    // Replace with your actual IP range
    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4('10.0.0.0/24'),
      ec2.Port.tcp(22),
      'Allow SSH access from trusted IPs only'
    );
    
    // Create a role for the EC2 instance with SSM access for secure management
    const instanceRole = new iam.Role(this, 'EC2InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
      ]
    });
    
    // Use Amazon Linux 2023 with dynamic AMI lookup
    const ami = ec2.MachineImage.latestAmazonLinux2023({
      cpuType: ec2.AmazonLinuxCpuType.X86_64
    });
    
    // Create the EC2 instance
    this.instance = new ec2.Instance(this, 'WebServer', {
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ami,
      securityGroup: this.securityGroup,
      keyName: 'test1', // Make sure this key exists in your account
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role: instanceRole,
      userData: ec2.UserData.custom(`#!/bin/bash
        # Update system packages
        dnf update -y
        
        # Install and start web server
        dnf install -y httpd
        systemctl enable httpd
        systemctl start httpd
        
        # Create a simple web page
        echo "<html><body><h1>Hello from AWS CDK!</h1><p>Server is up and running.</p></body></html>" > /var/www/html/index.html
      `)
    });
    
    Tags.of(this.instance).add('Name', `${id}-webserver`);
    Tags.of(this.instance).add('Environment', 'Development');
    
    // Define outputs
    new cdk.CfnOutput(this, 'PublicIP', {
      value: this.instance.instancePublicIp,
      description: 'Public IP address of the web server',
      exportName: `${id}-public-ip`,
    });

    new cdk.CfnOutput(this, 'VpcId', { 
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${id}-vpc-id`,
    });
    
    new cdk.CfnOutput(this, 'SecurityGroupId', { 
      value: this.securityGroup.securityGroupId,
      description: 'Security Group ID',
      exportName: `${id}-sg-id`,
    });
    
    new cdk.CfnOutput(this, 'InstanceId', { 
      value: this.instance.instanceId,
      description: 'EC2 Instance ID',
      exportName: `${id}-instance-id`,
    });
    
    new cdk.CfnOutput(this, 'SSHCommand', {
      value: `ssh -i ~/.ssh/test1.pem ec2-user@${this.instance.instancePublicIp}`,
      description: 'Command to SSH into the instance',
    });
  }
}
