provider "azurerm" {
  features {}

  client_id       = var.clientId
  client_secret   = var.clientSecret
  subscription_id = var.subscriptionId
  tenant_id       = var.tenantId
}

resource "azurerm_resource_group" "rg" {
  name     = "devops-lab-rg"
  location = "France Central"
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "devops-lab-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "devops-lab"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s"
    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    environment = "dev"
  }
}
