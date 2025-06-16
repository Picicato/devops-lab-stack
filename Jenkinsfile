pipeline {
    agent any

    environment {
        AZ_SUBSCRIPTION_ID = credentials('azure-subscription-id')
        AZ_CLIENT_ID       = credentials('azure-client-id')
        AZ_CLIENT_SECRET   = credentials('azure-client-secret')
        AZ_TENANT_ID       = credentials('azure-tenant-id')

        NAMESPACE = 'logging'
        KIBANA_RELEASE = 'kibana'
        ELASTICSEARCH_RELEASE = 'elasticsearch'
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

        stage('Clean Kibana pre-install resources') {
            steps {
                sh '''
                    LABEL_SELECTOR="app=kibana"
                    echo "Cleaning Kibana pre-install resources in namespace $NAMESPACE..."
                    kubectl delete configmap -l $LABEL_SELECTOR -n $NAMESPACE --ignore-not-found
                    kubectl delete serviceaccount -l $LABEL_SELECTOR -n $NAMESPACE --ignore-not-found
                    kubectl delete job -l $LABEL_SELECTOR -n $NAMESPACE --ignore-not-found
                    kubectl delete role -l $LABEL_SELECTOR -n $NAMESPACE --ignore-not-found
                    kubectl delete rolebinding -l $LABEL_SELECTOR -n $NAMESPACE --ignore-not-found
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

                    # Deploy other apps (http-echo, prometheus, grafana, kafka, elasticsearch)
                    helm upgrade --install http-echo helm/http-echo \
                        --namespace default \
                        --set image.repository=hashicorp/http-echo \
                        --set image.tag=latest \
                        --set args[0]="-text=hello from AKS"

                    helm upgrade --install prometheus prometheus-community/prometheus \
                        --namespace monitoring --create-namespace

                    helm upgrade --install grafana grafana/grafana \
                        --namespace monitoring \
                        --set adminPassword='admin' \
                        --set service.type=LoadBalancer

                    helm upgrade --install kafka bitnami/kafka \
                        --namespace kafka --create-namespace

                    helm upgrade --install elasticsearch elastic/elasticsearch \
                        --namespace $NAMESPACE --create-namespace \
                        --set replicas=1

                    # Kibana with wait and timeout, service LoadBalancer
                    helm upgrade --install $KIBANA_RELEASE elastic/kibana \
                        --namespace $NAMESPACE \
                        --set service.type=LoadBalancer \
                        --wait --timeout 10m
                '''
            }
        }

        stage('Retrieve Elasticsearch Password') {
            steps {
                script {
                    def elasticPassword = sh (
                        script: "kubectl get secret elasticsearch-master-credentials -n ${env.NAMESPACE} -o jsonpath='{.data.password}' | base64 --decode",
                        returnStdout: true
                    ).trim()
                    echo "Elasticsearch password retrieved."

                    // Pour usage ultérieur dans pipeline (exemple)
                    env.ELASTIC_PASSWORD = elasticPassword
                }
            }
        }

        stage('Test Elasticsearch Connection') {
            steps {
                sh '''
                    echo "Testing connection to Elasticsearch..."
                    kubectl port-forward svc/elasticsearch-master 9200:9200 -n $NAMESPACE &
                    PF_PID=$!
                    sleep 10
                    curl -u elastic:$ELASTIC_PASSWORD -k https://localhost:9200
                    kill $PF_PID
                '''
            }
        }
    }
}
