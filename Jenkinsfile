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
                checkout scm
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

        stage('Terraform Init & Apply') {
            steps {
                dir('terraform') {
                    sh '''
                        terraform init
                        terraform apply -auto-approve \
                            -var "clientId=$AZ_CLIENT_ID" \
                            -var "clientSecret=$AZ_CLIENT_SECRET" \
                            -var "subscriptionId=$AZ_SUBSCRIPTION_ID" \
                            -var "tenantId=$AZ_TENANT_ID"
                    '''
                }
            }
        }

        stage('Get AKS Credentials') {
            steps {
                sh '''
                    az aks get-credentials --resource-group devops-lab-rg \
                                           --name devops-lab-aks \
                                           --overwrite-existing
                '''
            }
        }

        stage('Deploy to AKS with Helm') {
            steps {
                sh '''
                    if ! command -v helm &> /dev/null; then
                      curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
                    fi

                    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
                    helm repo add grafana https://grafana.github.io/helm-charts
                    helm repo add bitnami https://charts.bitnami.com/bitnami
                    helm repo add elastic https://helm.elastic.co
                    helm repo update

                    # HTTP Echo app
                    helm upgrade --install http-echo helm/http-echo \
                        --namespace default \
                        --set image.repository=hashicorp/http-echo \
                        --set image.tag=latest \
                        --set args[0]="-text=hello from AKS"

                    # Prometheus
                    helm upgrade --install prometheus prometheus-community/prometheus \
                        --namespace monitoring --create-namespace

                    # Grafana
                    helm upgrade --install grafana grafana/grafana \
                        --namespace monitoring \
                        --set adminPassword='admin' \
                        --set service.type=LoadBalancer

                    # Kafka
                    helm upgrade --install kafka bitnami/kafka \
                        --namespace kafka --create-namespace

                    # ELK stack (ElasticSearch + Kibana)
                    helm upgrade --install elasticsearch elastic/elasticsearch \
                        --namespace logging --create-namespace \
                        --set replicas=1

                    helm upgrade --install kibana elastic/kibana \
                        --namespace logging \
                        --set service.type=LoadBalancer
                '''
            }
        }
    }
}
