#!/bin/bash

NAMESPACE=logging
RELEASE_NAME=kibana

echo "Suppression des ConfigMaps..."
kubectl delete configmap -l app=$RELEASE_NAME -n $NAMESPACE

echo "Suppression des ServiceAccounts..."
kubectl delete serviceaccount pre-install-${RELEASE_NAME}-${RELEASE_NAME} -n $NAMESPACE --ignore-not-found

echo "Suppression des Jobs..."
kubectl delete job -l app=$RELEASE_NAME -n $NAMESPACE --ignore-not-found

echo "Suppression des Roles..."
kubectl delete role pre-install-${RELEASE_NAME}-${RELEASE_NAME} -n $NAMESPACE --ignore-not-found

echo "Suppression des RoleBindings..."
kubectl delete rolebinding pre-install-${RELEASE_NAME}-${RELEASE_NAME} -n $NAMESPACE --ignore-not-found

echo "Suppression du Secret du serviceAccount Kibana..."
kubectl delete secret ${RELEASE_NAME}-${RELEASE_NAME}-es-token -n $NAMESPACE --ignore-not-found

echo "Nettoyage terminé."
