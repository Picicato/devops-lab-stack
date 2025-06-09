pipeline {
    agent any

    environment {
        AZ_SUBSCRIPTION_ID = credentials('azure-subscription-id')
        AZ_CLIENT_ID       = credentials('azure-client-id')
        AZ_CLIENT_SECRET   = credentials('azure-client-secret')
        AZ_TENANT_ID       = credentials('azure-tenant-id')
    }

    stages {
        stage('Checkout') {
            steps {
                // Cloner explicitement le dépôt si Jenkins ne le fait pas déjà
                git branch: 'main', url: 'https://github.com/Picicato/devops-lab-stack.git'
            }
        }

        stage('Login to Azure') {
            steps {
                sh '''
                    az login --service-principal \
                        --username "$AZ_CLIENT_ID" \
                        --password "$AZ_CLIENT_SECRET" \
                        --tenant "$AZ_TENANT_ID"
                    az account set --subscription "$AZ_SUBSCRIPTION_ID"
                '''
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                    az aks get-credentials --resource-group devops-lab-rg \
                                           --name devops-lab-aks \
                                           --overwrite-existing
                    kubectl apply -f k8s-manifests/http-echo-deployment.yaml
                '''
            }
        }
    }
}
