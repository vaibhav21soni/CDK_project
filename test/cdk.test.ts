import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CdkStack } from '../lib/cdk-stack';

describe('WebServerStack', () => {
  let app: App;
  let stack: CdkStack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new CdkStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('Snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('VPC is created with correct configuration', () => {
    // Check VPC resource
    template.resourceCountIs('AWS::EC2::VPC', 1);
    
    // Check subnets - should have 4 subnets (2 public, 2 private)
    template.resourceCountIs('AWS::EC2::Subnet', 4);
    
    // Check NAT Gateway
    template.resourceCountIs('AWS::EC2::NatGateway', 1);
    
    // Check Internet Gateway
    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  });

  test('EC2 instance is created with correct configuration', () => {
    // Check EC2 instance
    template.resourceCountIs('AWS::EC2::Instance', 1);
    
    // Check instance has user data
    template.hasResourceProperties('AWS::EC2::Instance', {
      UserData: Match.anyValue()
    });
    
    // Check instance has IAM role
    template.hasResourceProperties('AWS::EC2::Instance', {
      IamInstanceProfile: Match.anyValue()
    });
  });

  test('Security group has proper rules', () => {
    // Check security group
    template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
    
    // Check ingress rules
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: Match.arrayWith([
        Match.objectLike({
          FromPort: 80,
          ToPort: 80,
          IpProtocol: 'tcp',
          CidrIp: '0.0.0.0/0',
        }),
        Match.objectLike({
          FromPort: 22,
          ToPort: 22,
          IpProtocol: 'tcp',
          CidrIp: '10.0.0.0/24',
        })
      ])
    });
    
    // Check egress rules
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({
          CidrIp: '0.0.0.0/0',
        })
      ])
    });
  });

  test('IAM role is created with SSM policy', () => {
    // Check IAM role
    template.resourceCountIs('AWS::IAM::Role', 1);
    
    // Check managed policy attachment
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        Match.stringLikeRegexp('arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore')
      ])
    });
  });

  test('Outputs are properly defined', () => {
    // Check outputs
    template.hasOutput('PublicIP', {});
    template.hasOutput('VpcId', {});
    template.hasOutput('SecurityGroupId', {});
    template.hasOutput('InstanceId', {});
    template.hasOutput('SSHCommand', {});
  });
});
