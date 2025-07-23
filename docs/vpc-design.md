# VPC Design Documentation

## Overview

This document outlines the design decisions for the Virtual Private Cloud (VPC) infrastructure used in this project.

## VPC Configuration

| Property | Value | Description |
|----------|-------|-------------|
| CIDR Block | 10.0.0.0/16 | Provides 65,536 IP addresses |
| Region | us-east-1 | Primary deployment region |
| Availability Zones | 2 | For high availability |
| NAT Gateways | 1 | Cost-effective approach for development |

## Subnet Design

### Public Subnets

| Subnet | CIDR | Availability Zone | Purpose |
|--------|------|------------------|---------|
| Public Subnet 1 | 10.0.0.0/24 | us-east-1a | Web servers, load balancers |
| Public Subnet 2 | 10.0.1.0/24 | us-east-1b | Web servers, load balancers |

### Private Subnets

| Subnet | CIDR | Availability Zone | Purpose |
|--------|------|------------------|---------|
| Private Subnet 1 | 10.0.2.0/24 | us-east-1a | Application servers, databases |
| Private Subnet 2 | 10.0.3.0/24 | us-east-1b | Application servers, databases |

## Routing

### Public Route Tables

| Destination | Target | Description |
|-------------|--------|-------------|
| 10.0.0.0/16 | local | Local VPC traffic |
| 0.0.0.0/0 | Internet Gateway | Internet-bound traffic |

### Private Route Tables

| Destination | Target | Description |
|-------------|--------|-------------|
| 10.0.0.0/16 | local | Local VPC traffic |
| 0.0.0.0/0 | NAT Gateway | Outbound internet traffic |

## Security Considerations

1. **Network ACLs**: Default NACLs are used, which can be customized for additional security
2. **Security Groups**: Instance-level security with specific port allowances
3. **Public/Private Separation**: Clear separation of public-facing and private resources
4. **NAT Gateway**: Private resources can access the internet but cannot be directly accessed

## High Availability Design

The VPC is designed with high availability in mind:

1. **Multiple AZs**: Resources are spread across two availability zones
2. **Redundant Subnets**: Each tier (public/private) has subnets in multiple AZs

## Cost Optimization

1. **Single NAT Gateway**: Using one NAT Gateway instead of one per AZ to reduce costs
2. **Right-sized CIDR blocks**: Subnet sizes are appropriate for expected resource counts

## Future Enhancements

1. **VPC Flow Logs**: Enable for network monitoring and security analysis
2. **Additional NAT Gateways**: Add one per AZ for production environments
3. **Transit Gateway**: For connecting to other VPCs or on-premises networks
4. **VPC Endpoints**: For private access to AWS services

## CDK Implementation

The VPC is implemented using the high-level `ec2.Vpc` construct, which automatically creates the necessary components:

```typescript
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
```
