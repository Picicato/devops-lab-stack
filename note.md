```jenkinsfile
stage('Deploy Filebeat') {
    steps {
        sh '''
            helm repo add elastic https://helm.elastic.co
            helm repo update

            helm upgrade --install filebeat elastic/filebeat \
                --namespace $NAMESPACE \
                --set daemonset.enabled=true \
                --set elasticsearch.hosts[0]=http://elasticsearch-master:9200 \
                --set elasticsearch.username=elastic \
                --set elasticsearch.password=$ELASTIC_PASSWORD \
                --wait --timeout 5m
        '''
    }
}
```
