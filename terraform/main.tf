provider "azurerm" {
  features {}

  client_id       = var.clientId
  client_secret   = var.clientSecret
  subscription_id = var.subscriptionId
  tenant_id       = var.tenantId
}

resource "azurerm_resource_group" "rg" {
  name     = "devops-lab-rg"
  location = "East US"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "devops-lab-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "devops-lab"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"
  }
}

output "kube_config" {
  value = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}
