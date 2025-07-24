# Web Server Infrastructure Architecture

## Architecture Diagram

```mermaid
flowchart TD
 subgraph subGraph0["AZ 1"]
        PublicSubnet1["Public Subnet 1\n10.0.0.0/24"]
        PrivateSubnet1["Private Subnet 1\n10.0.2.0/24"]
  end
 subgraph subGraph1["AZ 2"]
        PublicSubnet2["Public Subnet 2\n10.0.1.0/24"]
        PrivateSubnet2["Private Subnet 2\n10.0.3.0/24"]
  end
 subgraph subGraph2["VPC (10.0.0.0/16)"]
        subGraph0
        subGraph1
        IGW["Internet Gateway"]
        NATGW["NAT Gateway"]
        EC2["EC2 Instance\nAmazon Linux 2023\nApache Web Server"]
        SG["Security Group\nPort 80, 22"]
        PublicRT["Public Route Table"]
        PrivateRT["Private Route Table"]
  end
 subgraph subGraph3["AWS Cloud"]
        subGraph2
        IAM["IAM Role\nSSM Access"]
        Internet["Internet"]
  end
    Internet <--> IGW
    IGW <--> PublicSubnet1 & PublicSubnet2
    PublicSubnet1 <--> PublicRT & NATGW
    PublicSubnet2 <--> PublicRT
    PublicRT <--> IGW
    NATGW <--> PrivateRT
    PrivateSubnet1 <--> PrivateRT
    PrivateSubnet2 <--> PrivateRT
    EC2 <--> PublicSubnet1 & SG & IAM

    style PublicSubnet1 fill:#B8E6F9,stroke:#333,stroke-width:1px
    style PrivateSubnet1 fill:#D5F6D5,stroke:#333,stroke-width:1px
    style PublicSubnet2 fill:#B8E6F9,stroke:#333,stroke-width:1px
    style PrivateSubnet2 fill:#D5F6D5,stroke:#333,stroke-width:1px
    style IGW fill:#FF9900,stroke:#333,stroke-width:1px
    style NATGW fill:#FF9900,stroke:#333,stroke-width:1px
    style EC2 fill:#FF9900,stroke:#333,stroke-width:1px
    style SG fill:#FF9900,stroke:#333,stroke-width:1px
```

## Component Description

1. **VPC**: Virtual Private Cloud with CIDR block 10.0.0.0/16
2. **Subnets**:
   - Public Subnets: For resources that need direct internet access
   - Private Subnets: For resources that need outbound internet access only
3. **Internet Gateway**: Allows communication between VPC and the internet
4. **NAT Gateway**: Allows private subnet resources to access the internet
5. **EC2 Instance**: Web server running Amazon Linux 2023 with Apache
6. **Security Group**: Firewall rules controlling traffic to/from EC2 instance
7. **IAM Role**: Provides permissions for EC2 instance to use AWS services
8. **Route Tables**: Control traffic routing within the VPC

## Security Considerations

- SSH access is restricted to specific IP ranges
- Web server is accessible on port 80 from anywhere
- EC2 instance can be managed via AWS Systems Manager (SSM)
- All outbound traffic is allowed from the EC2 instance
