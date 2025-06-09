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

        stage('Deploy to AKS with Helm') {
            steps {
                sh '''
                    az aks get-credentials --resource-group devops-lab-rg \
                                           --name devops-lab-aks \
                                           --overwrite-existing
                    
                    # Installer ou mettre à jour le chart Helm
                    helm upgrade --install http-echo helm/http-echo \
                        --namespace default \
                        --set image.repository=hashicorp/http-echo \
                        --set image.tag=latest \
                        --set args[0]="-text=hello from AKS"
                '''
            }
        }
    }
}
